import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import {
  Discount,
  DiscountType,
} from "../../common/entities/discount.entity";
import { DiscountStatus } from "../../common/enums/discount-status.enum";
import { Product } from "../../common/entities/product.entity";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toDiscountResource } from "./discount.resource";
import { Collection } from "../../common/entities/collection.entity";

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private discountsRepository: Repository<Discount>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>
  ) { }

  async create(
    createDiscountDto: CreateDiscountDto,
    userId: string
  ): Promise<Discount> {
    // Validate dates
    const startDate = new Date(createDiscountDto.startDate);
    const endDate = new Date(createDiscountDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException("End date must be after start date");
    }

    // Validate buy_x_get_y types
    if (
      createDiscountDto.type === DiscountType.BUY_X_GET_Y_FREE ||
      createDiscountDto.type === DiscountType.BUY_X_GET_Y_DISCOUNT
    ) {
      if (!createDiscountDto.buyQuantity || !createDiscountDto.getQuantity) {
        throw new BadRequestException(
          "buyQuantity and getQuantity are required for buy_x_get_y types"
        );
      }
      if (
        !createDiscountDto.eligibleProductIds ||
        createDiscountDto.eligibleProductIds.length === 0
      ) {
        throw new BadRequestException(
          "eligibleProductIds are required for buy_x_get_y types"
        );
      }
    }

    // Validate buy_x_get_y_free type
    if (createDiscountDto.type === DiscountType.BUY_X_GET_Y_FREE) {
      if (
        !createDiscountDto.freeProductIds ||
        createDiscountDto.freeProductIds.length === 0
      ) {
        throw new BadRequestException(
          "freeProductIds are required for buy_x_get_y_free type"
        );
      }
    }

    // Check if promo code is unique
    if (createDiscountDto.promoCode) {
      const existingDiscount = await this.discountsRepository.findOne({
        where: { promoCode: createDiscountDto.promoCode },
      });
      if (existingDiscount) {
        throw new BadRequestException("Promo code must be unique");
      }
    }

    const discount = this.discountsRepository.create({
      ...createDiscountDto,
      startDate,
      endDate,
      user: { id: userId },
    });

    // Handle product associations
    if (
      createDiscountDto.productIds &&
      createDiscountDto.productIds.length > 0
    ) {
      const products = await this.productsRepository.findBy({
        id: In(createDiscountDto.productIds),
      });
      discount.products = products;
    }

    if (
      createDiscountDto.collectionIds &&
      createDiscountDto.collectionIds.length > 0
    ) {
      const collections = await this.collectionsRepository.findBy({
        id: In(createDiscountDto.collectionIds),
      });
      discount.collections = collections;
    }
    const savedDiscount = await this.discountsRepository.save(discount);
    return this.findOne(savedDiscount.id);
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findDiscountsWithFilters(paginationDto, false);
  }

  async findDeletedDiscounts(paginationDto: PaginationDto): Promise<any> {
    return this.findDiscountsWithFilters(paginationDto, true);
  }

  private async findDiscountsWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.discountsRepository
      .createQueryBuilder("discount")
      .leftJoinAndSelect("discount.products", "products")
      .leftJoinAndSelect("discount.collections", "collections");

    if (includeDeleted) {
      queryBuilder.withDeleted().where("discount.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "discount.name ILIKE :search OR discount.description ILIKE :search OR discount.promoCode ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    if (status) {
      queryBuilder.andWhere("discount.status = :status", { status });
    }

    const [discounts, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy(
        includeDeleted ? "discount.deletedAt" : "discount.createdAt",
        "DESC"
      )
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted discounts retrieved successfully"
        : "Discounts retrieved successfully",
      items: discounts.map(toDiscountResource),
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

  async findOne(id: string): Promise<any> {
    const discount = await this.discountsRepository.findOne({
      where: { id },
      relations: ["products"],
    });
    if (!discount) {
      throw new NotFoundException("Discount not found");
    }
    return toDiscountResource(discount);
  }

  async update(
    id: string,
    updateDiscountDto: UpdateDiscountDto
  ): Promise<Discount> {
    const discount = await this.discountsRepository.findOne({
      where: { id },
      relations: ["products", "collections"],
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    // Validate dates if provided
    if (updateDiscountDto.startDate && updateDiscountDto.endDate) {
      const startDate = new Date(updateDiscountDto.startDate);
      const endDate = new Date(updateDiscountDto.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException("End date must be after start date");
      }
    }

    // Check if promo code is unique (if being updated)
    if (
      updateDiscountDto.promoCode &&
      updateDiscountDto.promoCode !== discount.promoCode
    ) {
      const existingDiscount = await this.discountsRepository.findOne({
        where: { promoCode: updateDiscountDto.promoCode },
      });
      if (existingDiscount && existingDiscount.id !== id) {
        throw new BadRequestException("Promo code must be unique");
      }
    }

    // Handle product associations
    if (updateDiscountDto.productIds) {
      const products = await this.productsRepository.findBy({
        id: In(updateDiscountDto.productIds),
      });
      discount.products = products;
    }

    if (updateDiscountDto.collectionIds) {
      const collections = await this.collectionsRepository.findBy({
        id: In(updateDiscountDto.collectionIds),
      });
      discount.collections = collections;
    }

    // Update dates if provided
    if (updateDiscountDto.startDate) {
      discount.startDate = new Date(updateDiscountDto.startDate);
    }
    if (updateDiscountDto.endDate) {
      discount.endDate = new Date(updateDiscountDto.endDate);
    }

    Object.assign(discount, updateDiscountDto);
    return this.findOne(discount.id);
  }

  async remove(id: string): Promise<void> {
    const discount = await this.discountsRepository.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException("Discount not found");
    }
    await this.discountsRepository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    const discount = await this.discountsRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!discount) {
      throw new NotFoundException("Discount not found");
    }
    await this.discountsRepository.restore(id);
  }

  async findByPromoCode(promoCode: string): Promise<any> {
    const discount = await this.discountsRepository.findOne({
      where: { promoCode, status: DiscountStatus.ACTIVE },
      relations: ["products"],
    });

    if (!discount) {
      throw new NotFoundException("Invalid or inactive promo code");
    }

    // Check if discount is expired
    const now = new Date();
    if (now < discount.startDate || now > discount.endDate) {
      throw new BadRequestException("Discount is not active at this time");
    }

    // Check usage limit
    if (discount.usedCount >= discount.usageLimit) {
      throw new BadRequestException("Discount usage limit exceeded");
    }

    return toDiscountResource(discount);
  }

  async getActiveDiscounts(): Promise<any> {
    const now = new Date();
    const discounts = await this.discountsRepository.find({
      where: {
        status: DiscountStatus.ACTIVE,
        isPublic: true,
      },
      relations: ["products"],
    });

    const activeDiscounts = discounts.filter(
      (discount) => now >= discount.startDate && now <= discount.endDate
    );

    return {
      status: "success",
      message: "Active discounts retrieved successfully",
      discounts: activeDiscounts.map(toDiscountResource),
    };
  }

  async updateStatusByIds(ids: string[], status: string): Promise<any> {
    if (!ids || ids.length === 0) {
      return {
        status: "success",
        message: "No IDs provided; nothing to update",
        items: [],
      };
    }

    switch (status) {
      case "restore":
        await this.discountsRepository.restore({ id: In(ids) });
        break;
      case "archived":
        await this.discountsRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.discountsRepository.update(
          { id: In(ids) },
          { status: status as DiscountStatus }
        );
        break;
    }

    const updated = await this.discountsRepository.find({
      where: { id: In(ids) },
      relations: ["products"],
      withDeleted: true,
    });

    return {
      status: "success",
      message: "Discounts updated successfully",
      items: updated.map(toDiscountResource),
    };
  }
}
