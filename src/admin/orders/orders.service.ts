import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  Like,
  Raw,
  In,
} from "typeorm";
import { Order } from "../../common/entities/order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrderStatus } from "../../common/enums/order-status.enum";
import { Discount } from "../../common/entities/discount.entity";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toOrderResource } from "./order.resource";
import { ProductVariant } from "../../common/entities/product-variant.entity";
import { Product } from "../../common/entities/product.entity";
import { User } from "../../common/entities/user.entity";
import { OrderProduct } from "../../common/entities/order-products.entity";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    // ✅ Validate guest
    const guest = await this.userRepository.findOne({
      where: { id: createOrderDto.guestId },
    });
    if (!guest) throw new NotFoundException("Guest not found.");

    // ---- Process Order Items ----
    const orderProducts: OrderProduct[] = [];

    for (const item of createOrderDto.orderItems) {
      const product = item.productId
        ? await this.productRepository.findOne({
          where: { id: item.productId },
        })
        : null;

      if (item.productId && !product) {
        throw new NotFoundException(
          `Product not found for ID: ${item.productId}`
        );
      }

      const variant = item.variantId
        ? await this.productVariantRepository.findOne({
          where: { id: item.variantId, productId: item.productId },
        })
        : null;

      if (item.variantId && !variant) {
        throw new NotFoundException(
          `Variant not found for ID: ${item.variantId} (Product ID: ${item.productId})`
        );
      }

      // ---- Calculate subtotal per item ----
      const base =
        Number(item.pricePerNight) * item.nights * item.numberOfRooms;
      const extra = item.extraBed?.pricePerNight
        ? Number(item.extraBed.pricePerNight) * item.nights
        : 0;
      const food =
        item.foodOptions?.reduce(
          (sum, option) =>
            sum + Number(option.additionalPrice || 0) * item.nights,
          0
        ) || 0;

      const subtotal = base + extra + food;

      // ---- Validate Discount ----
      let discountDetails: any = null;
      if (createOrderDto.discountDetails?.discountCode) {
        const discountValidation = await this.validateAndCalculateDiscount(
          createOrderDto.discountDetails.discountCode,
          subtotal,
          guest.id
        );

        if (!discountValidation.isValid) {
          throw new BadRequestException(discountValidation.errorMessage);
        }

        discountDetails = {
          ...createOrderDto.discountDetails,
          discountDescription: discountValidation.discount.description,
          minimumAmount: discountValidation.discount.minimumOrderValue,
          maximumDiscount: discountValidation.discount.maximumDiscountValue,
        };
      }
      const productSnapshot = product
        ? {
          id: product.id,
          name: product.name,
          commission: product.commission,
          cancellationPolicy: product.cancellationPolicy,
          files: product.files,
        }
        : null;

      const productVariantSnapshot = variant
        ? {
          id: variant.id,
          name: variant.name,
          price: variant.price,
          capacity: variant.capacity,
          files: variant.files,
        }
        : null;

      // ✅ Build OrderProduct (no need to set orderId manually)
      const orderProduct = this.orderProductRepository.create({
        product: item.productId
          ? ({ id: item.productId } as Product)
          : undefined,
        productSnapshot,
        productVariant: item.variantId
          ? ({ id: item.variantId } as ProductVariant)
          : undefined,
        productVariantSnapshot,
        currency: item.currency,
        pricePerNight: item.pricePerNight,
        numberOfRooms: item.numberOfRooms,
        nights: item.nights,
        capacity: item.capacity,
        commissionPercentage: product?.commission?.percentage ?? 0,
        extraBed: item.extraBed,
        foodOptions: item.foodOptions,
        specialRequests: item.specialRequests,
        cancellationPolicy: product?.cancellationPolicy || null,
        discountDetails,
        subtotal,
      });

      orderProducts.push(orderProduct);
    }

    // ---- Create Order ----
    const invoiceNo = await this.generateInvoiceNumber();

    const order = this.orderRepository.create({
      user: { id: userId },
      guest: { id: createOrderDto.guestId },
      invoiceNo,
      checkInDate: new Date(createOrderDto.checkInDate),
      checkOutDate: new Date(createOrderDto.checkOutDate),
      guests: createOrderDto.guests,
      currency: createOrderDto.currency,
      status: createOrderDto.status,
      notes: createOrderDto.notes,
      additionalDetails: createOrderDto.additionalDetails,
      riskDetails: createOrderDto.riskDetails,
      conversionSummary: createOrderDto.conversionSummary,
      communicationChannels: createOrderDto.communicationChannels,
      tags: createOrderDto.tags,
      orderProducts, // ✅ cascade insert
      // payment: createOrderDto.payment,
    });

    const savedOrder = await this.orderRepository.save(order);

    // ✅ Lifecycle hooks will auto-calc subtotal, discount, tax, commission
    return this.findOne(savedOrder.id);
  }

  async findAll(paginationDto: PaginationDto) {
    return this.findOrdersWithFilters(paginationDto, false);
  }

  async findDeletedOrders(paginationDto: PaginationDto) {
    return this.findOrdersWithFilters(paginationDto, true);
  }

  private async findOrdersWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search } = paginationDto;
    const skip = (page - 1) * limit;
    const queryBuilder = this.orderRepository.createQueryBuilder("order");
    if (includeDeleted) {
      queryBuilder.withDeleted().where("order.deletedAt IS NOT NULL");
    }
    queryBuilder
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.guest", "guest")
      .leftJoinAndSelect("order.orderProducts", "orderProducts")
      .leftJoinAndSelect("orderProducts.product", "product")
      .leftJoinAndSelect("product.files", "productFiles")
      .leftJoinAndSelect("orderProducts.productVariant", "productVariant")
      .leftJoinAndSelect("productVariant.files", "variantFiles");
    if (search) {
      const searchCondition =
        "order.invoiceNo ILIKE :search OR product.name ILIKE :search OR productVariant.name ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }
    const [orders, total] = await queryBuilder
      .orderBy(includeDeleted ? "order.deletedAt" : "order.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    return {
      status: "success",
      message: includeDeleted
        ? "Deleted orders retrieved successfully"
        : "Orders retrieved successfully",
      items: orders.map(toOrderResource),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        "user",
        "orderProducts",
        "orderProducts.product",
        "orderProducts.productVariant",
        "orderProducts.product.files",
        "orderProducts.productVariant.files",
        "guest",
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return toOrderResource(order);
  }

  async findByUser(userId: string) {
    const orders = await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: [
        "user",
        "orderProducts",
        "orderProducts.product",
        "orderProducts.productVariant",
        "orderProducts.product.files",
        "orderProducts.productVariant.files",
        "guest",
      ],
      order: { createdAt: "DESC" },
    });

    return {
      data: orders.map((order) => toOrderResource(order)),
    };
  }

  async findByStatus(status: OrderStatus) {
    const orders = await this.orderRepository.find({
      where: { status },
      relations: [
        "user",
        "orderProducts",
        "orderProducts.product",
        "orderProducts.productVariant",
        "orderProducts.product.files",
        "orderProducts.productVariant.files",
        "guest",
      ],
      order: { createdAt: "DESC" },
    });

    return {
      data: orders.map((order) => toOrderResource(order)),
    };
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["guest", "user", "orderProducts"],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // ❌ Prevent updates on cancelled/completed orders
    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot update order with status: ${order.status}`
      );
    }

    // ✅ Update guest if needed
    let guest = order.guest;
    if (updateOrderDto.guestId) {
      guest = await this.userRepository.findOne({
        where: { id: updateOrderDto.guestId },
      });
      if (!guest) throw new NotFoundException("Guest not found.");
    }

    // ---- Rebuild order items ----
    const orderProducts: OrderProduct[] = [];

    if (updateOrderDto.orderItems?.length) {
      for (const item of updateOrderDto.orderItems) {
        const product = item.productId
          ? await this.productRepository.findOne({
            where: { id: item.productId },
          })
          : null;

        if (item.productId && !product) {
          throw new NotFoundException(
            `Product not found for ID: ${item.productId}`
          );
        }

        const variant = item.variantId
          ? await this.productVariantRepository.findOne({
            where: { id: item.variantId, productId: item.productId },
          })
          : null;

        if (item.variantId && !variant) {
          throw new NotFoundException(
            `Variant not found for ID: ${item.variantId} (Product ID: ${item.productId})`
          );
        }

        // ✅ Calculate subtotal
        const base =
          Number(item.pricePerNight) * item.nights * item.numberOfRooms;

        const extra = item.extraBed?.pricePerNight
          ? Number(item.extraBed.pricePerNight) * item.nights
          : 0;

        const food = item.foodOptions?.length
          ? item.foodOptions.reduce(
            (sum, option) =>
              sum + Number(option.additionalPrice || 0) * item.nights,
            0
          )
          : 0;

        const subtotal = base + extra + food;

        // ✅ Build snapshots
        const productSnapshot = product
          ? {
            id: product.id,
            name: product.name,
            percentage: product.commission?.percentage ?? 0,
            cancellationPolicy: product.cancellationPolicy,
            files: product.files,
          }
          : null;

        const productVariantSnapshot = variant
          ? {
            id: variant.id,
            name: variant.name,
            price: variant.price,
            capacity: variant.capacity,
            files: variant.files,
          }
          : null;

        const orderProduct = this.orderProductRepository.create({
          orderId: order.id,
          product: item.productId
            ? ({ id: item.productId } as Product)
            : undefined,
          productSnapshot,
          productVariant: item.variantId
            ? ({ id: item.variantId } as ProductVariant)
            : undefined,
          productVariantSnapshot,
          currency: item.currency,
          pricePerNight: item.pricePerNight,
          numberOfRooms: item.numberOfRooms,
          nights: item.nights,
          capacity: item.capacity,
          commissionPercentage: product?.commission?.percentage ?? 0,
          extraBed: item.extraBed,
          foodOptions: item.foodOptions,
          specialRequests: item.specialRequests,
          cancellationPolicy: product?.cancellationPolicy || null,
          subtotal,
        });

        orderProducts.push(orderProduct);
      }

      // 🔄 Replace existing order items
      await this.orderProductRepository.delete({ orderId: order.id });
    }

    // ---- Discount Handling ----
    let discountDetails: any = null;
    if (updateOrderDto.discountDetails?.discountCode) {
      const discountValidation = await this.validateAndCalculateDiscount(
        updateOrderDto.discountDetails.discountCode,
        orderProducts.reduce((sum, item) => sum + (item.subtotal ?? 0), 0),
        guest.id
      );

      if (!discountValidation.isValid) {
        throw new BadRequestException(discountValidation.errorMessage);
      }

      discountDetails = {
        ...updateOrderDto.discountDetails,
        discountDescription: discountValidation.discount.description,
        minimumAmount: discountValidation.discount.minimumOrderValue,
        maximumDiscount: discountValidation.discount.maximumDiscountValue,
      };
    }

    // ---- Update order fields ----
    Object.assign(order, {
      ...updateOrderDto,
      guest: { id: guest.id },
      discountDetails,
      orderProducts,
    });

    const updatedOrder = await this.orderRepository.save(order);

    // ✅ Lifecycle hook in `OrderProduct` will handle tax, commission, total
    return this.findOne(updatedOrder.id);
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        "user",
        "product",
        "productVariant",
        "product.files",
        "productVariant.files",
        "guest",
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validate status transition
    this.validateStatusTransition(order.status, status);

    order.status = status;
    const updatedOrder = await this.orderRepository.save(order);
    return toOrderResource(updatedOrder);
  }

  async remove(id: string) {
    const order = await this.findOne(id);

    // Check if order can be deleted
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot delete order with status: ${order.status}`
      );
    }

    await this.orderRepository.softDelete(id);
    return { message: "Order deleted successfully" };
  }

  async restore(id: string) {
    await this.orderRepository.restore(id);
    return { message: "Order restored successfully" };
  }

  async updateStatusByIds(ids: string[], status: OrderStatus): Promise<any> {
    if (!ids || ids.length === 0) {
      return {
        status: "success",
        message: "No IDs provided; nothing to update",
        items: [],
      };
    }

    // Update orders with the new status
    await this.orderRepository.update({ id: In(ids) }, { status });

    const updated = await this.orderRepository.find({
      where: { id: In(ids) },
      relations: [
        "user",
        "orderProducts",
        "orderProducts.product",
        "orderProducts.productVariant",
        "orderProducts.product.files",
        "orderProducts.productVariant.files",
        "guest",
      ],
    });

    return {
      status: "success",
      message: "Orders updated successfully",
      items: updated.map(toOrderResource),
    };
  }

  async cancelOrder(id: string, reason?: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        "user",
        "orderProducts",
        "orderProducts.product",
        "orderProducts.productVariant",
        "orderProducts.product.files",
        "orderProducts.productVariant.files",
        "guest",
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException("Order is already cancelled");
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException("Cannot cancel completed order");
    }

    order.status = OrderStatus.CANCELLED;
    if (reason) {
      order.notes = order.notes
        ? `${order.notes}\nCancellation reason: ${reason}`
        : `Cancellation reason: ${reason}`;
    }

    const updatedOrder = await this.orderRepository.save(order);
    return toOrderResource(updatedOrder);
  }

  async confirmOrder(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        "user",
        "orderProducts",
        "orderProducts.product",
        "orderProducts.productVariant",
        "orderProducts.product.files",
        "orderProducts.productVariant.files",
        "guest",
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Order must be in PENDING status to confirm. Current status: ${order.status}`
      );
    }

    order.status = OrderStatus.CONFIRMED;
    const updatedOrder = await this.orderRepository.save(order);
    return toOrderResource(updatedOrder);
  }

  async completeOrder(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        "user",
        "orderProducts",
        "orderProducts.product",
        "orderProducts.productVariant",
        "orderProducts.product.files",
        "orderProducts.productVariant.files",
        "guest",
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException(
        `Order must be in CONFIRMED status to complete. Current status: ${order.status}`
      );
    }

    order.status = OrderStatus.COMPLETED;
    const updatedOrder = await this.orderRepository.save(order);
    return toOrderResource(updatedOrder);
  }

  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const prefix = `GKS-${year}${month}${day}`;

    // Find the last order for today
    const lastOrder = await this.orderRepository.findOne({
      where: {
        invoiceNo: Like(`${prefix}%`),
      },
      order: { invoiceNo: "DESC" },
    });

    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.invoiceNo.replace(prefix, ""));
      const nextNumber = lastNumber + 1;
      return `${prefix}${String(nextNumber).padStart(3, "0")}`;
    }

    return `${prefix}001`;
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
        OrderStatus.ON_HOLD,
      ],
      [OrderStatus.PROCESSING]: [
        OrderStatus.CONFIRMED,
        OrderStatus.FAILED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.ON_HOLD]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.FAILED]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  async getOrderStatistics() {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all(
      [
        this.orderRepository.count(),
        this.orderRepository.count({ where: { status: OrderStatus.PENDING } }),
        this.orderRepository.count({
          where: { status: OrderStatus.CONFIRMED },
        }),
        this.orderRepository.count({
          where: { status: OrderStatus.COMPLETED },
        }),
        this.orderRepository.count({
          where: { status: OrderStatus.CANCELLED },
        }),
      ]
    );

    const revenueResult = await this.orderRepository
      .createQueryBuilder("order")
      .select("SUM(order.total)", "totalRevenue")
      .where("order.status IN (:...statuses)", {
        statuses: [OrderStatus.COMPLETED, OrderStatus.CONFIRMED],
      })
      .getRawOne();

    const revenue = parseFloat(revenueResult?.totalRevenue || "0");

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      revenue,
    };
  }

  private async validateAndCalculateDiscount(
    discountCode: string,
    totalAmount: number,
    userId: string
  ): Promise<{
    isValid: boolean;
    discountAmount: number;
    finalAmount: number;
    discount: Discount;
    errorMessage?: string;
  }> {
    // Find the discount code
    const discount = await this.discountRepository.findOne({
      where: { promoCode: discountCode },
    });
    console.log(discount);
    if (!discount) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: totalAmount,
        discount: null,
        errorMessage: "Invalid discount code",
      };
    }

    // Check if discount is active
    if (discount.status !== "active") {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: totalAmount,
        discount: null,
        errorMessage: "Discount code is not active",
      };
    }

    // Check if discount has expired
    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: totalAmount,
        discount: null,
        errorMessage: "Discount code is not yet valid",
      };
    }

    if (discount.endDate && new Date(discount.endDate) < now) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: totalAmount,
        discount: null,
        errorMessage: "Discount code has expired",
      };
    }

    // Check minimum amount requirement
    if (
      discount.minimumOrderValue &&
      totalAmount < discount.minimumOrderValue
    ) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: totalAmount,
        discount: null,
        errorMessage: `Minimum order amount of ${discount.minimumOrderValue} required`,
      };
    }

    // Check usage limits
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: totalAmount,
        discount: null,
        errorMessage: "Discount code usage limit exceeded",
      };
    }
    const userUsageCount = await this.orderRepository.count({
      where: {
        user: { id: userId },
        discountDetails: Raw(
          (alias) => `${alias} @> '{"discountCode": "${discountCode}"}'`
        ),
      },
    });
    // Check per-user usage limit (assuming 1 usage per user for now)
    // const userUsageCount = await this.orderRepository.count({
    //   where: {
    //     user: { id: userId },
    //     discountDetails: Like(`%"discountCode":"${discountCode}"%`),
    //   },
    // });

    if (userUsageCount >= 1) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: totalAmount,
        discount: null,
        errorMessage: "You have already used this discount code",
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = (totalAmount * discount.value) / 100;
      // Apply maximum discount limit if set
      if (
        discount.maximumDiscountValue &&
        discountAmount > discount.maximumDiscountValue
      ) {
        discountAmount = discount.maximumDiscountValue;
      }
    } else if (discount.type === "fixed") {
      discountAmount = discount.value;
    }

    // Ensure discount doesn't exceed total amount
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    const finalAmount = totalAmount - discountAmount;

    return {
      isValid: true,
      discountAmount,
      finalAmount,
      discount,
    };
  }
}
