import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Product } from "../../common/entities/product.entity";
import { File } from "../../common/entities/file.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { toProductResource } from "./product.resource";
import { EntityStatus } from "../../common/enums/status.enum";
import slugify from "slugify";
import { Collection } from "../../common/entities/collection.entity";
import { Type as ProductType } from "../../common/entities/type.entity";
import { Amenity } from "../../common/entities/amenity.entity";
import { ProductVariantsService } from "./product-variants.service";
import { UpdateProductVariantDto } from "./dto/update-product-variant.dto";
import { ProductCommission } from "../../common/entities/product-commission.entity";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(File)
    private filesRepository: Repository<File>,
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
    @InjectRepository(ProductType)
    private typesRepository: Repository<ProductType>,
    @InjectRepository(ProductCommission)
    private productCommissionRepository: Repository<ProductCommission>,

    @InjectRepository(Amenity)
    private amenitiesRepository: Repository<Amenity>,
    private productVariantsService: ProductVariantsService
  ) { }

  async create(
    createProductDto: CreateProductDto,
    userId: string
  ): Promise<Product> {
    try {
      try {
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }

        const logFile = path.join(logDir, 'CreateProductDto.log');
        const timestamp = new Date().toISOString();
        const logEntry = {
          timestamp,
          createProductDto
        };

        fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + '\n' + '---\n');
      } catch (error) {
        console.error('Error logging CreateProductDto:', error);
      }
      let baseSlug = slugify(createProductDto.name, {
        lower: true,
        strict: true,
      });
      let slug = baseSlug;
      let count = 1;

      // Ensure uniqueness
      while (await this.productsRepository.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${count++}`;
      }

      let type = null;
      if (createProductDto.typeId) {
        type = await this.typesRepository.findOne({
          where: { id: createProductDto.typeId },
        });
      }

      const product = this.productsRepository.create({
        ...createProductDto,
        slug,
        user: { id: userId },
        partner: { id: createProductDto.partnerId },
        type,
      });

      // Handle file associations
      if (createProductDto.fileIds && createProductDto.fileIds.length > 0) {
        const files = await this.filesRepository.findBy({
          id: In(createProductDto.fileIds),
        });
        product.files = files;
      }

      if (
        createProductDto.collectionIds &&
        createProductDto.collectionIds.length > 0
      ) {
        const collections = await this.collectionsRepository.findBy({
          id: In(createProductDto.collectionIds),
        });
        product.collections = collections;
      }

      if (
        createProductDto.amenityIds &&
        createProductDto.amenityIds.length > 0
      ) {
        const amenities = await this.amenitiesRepository.findBy({
          id: In(createProductDto.amenityIds),
        });
        product.amenities = amenities;
      }

      product.commission = this.productCommissionRepository.create({
        percentage: 0,
        product,
        partner: { id: createProductDto.partnerId },
      });

      const savedProduct = await this.productsRepository.save(product);
      // if (createProductDto.variants && createProductDto.variants.length > 0) {
      //   for (const variantDto of createProductDto.variants) {
      //     await this.productVariantsService.create({
      //       ...variantDto,
      //       productId: savedProduct.id, // ensure relation
      //     });
      //   }
      // }
      return this.findOne(savedProduct.id);
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findProductsWithFilters(paginationDto, false);
  }

  async findDeletedProducts(paginationDto: PaginationDto): Promise<any> {
    return this.findProductsWithFilters(paginationDto, true);
  }

  private async findProductsWithFilters(
    paginationDto: PaginationDto,
    includeDeleted = false
  ): Promise<any> {
    const { page, limit, search, status } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productsRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.files", "files")
      .leftJoinAndSelect("product.variants", "variants")
      .leftJoinAndSelect("variants.amenities", "variantAmenities")
      .leftJoinAndSelect("variants.files", "variantFiles")
      .leftJoinAndSelect("product.collections", "collections")
      .leftJoinAndSelect("product.amenities", "amenities")
      .leftJoinAndSelect("product.partner", "partner")
      .leftJoinAndSelect("product.user", "user")
      .leftJoinAndSelect("product.type", "type")
      .leftJoinAndSelect("product.commission", "commission");

    if (includeDeleted) {
      queryBuilder.withDeleted().where("product.deletedAt IS NOT NULL");
    }

    if (search) {
      const searchCondition =
        "product.name ILIKE :search OR product.description ILIKE :search";
      if (includeDeleted) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    if (status) {
      queryBuilder.andWhere("product.status = :status", { status });
    }

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy(
        includeDeleted ? "product.deletedAt" : "product.createdAt",
        "DESC"
      )
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: "success",
      message: includeDeleted
        ? "Deleted products retrieved successfully"
        : "Products retrieved successfully",
      items: products.map(toProductResource),
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
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: [
        "files",
        "variants",
        "commission",
        "variants.amenities",
        "variants.files",
        "collections",
        "type",
        "amenities",
        "user",
        "partner",
      ],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return toProductResource(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ["files", "type", "collections", "amenities", "commission"],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    try {
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, 'updateProductDto.log');
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        updateProductDto
      };

      fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + '\n' + '---\n');
    } catch (error) {
      console.error('Error logging updateProductDto:', error);
    }

    // Handle file associations
    if (updateProductDto.fileIds !== undefined) {
      if (updateProductDto.fileIds.length > 0) {
        const files = await this.filesRepository.findBy({
          id: In(updateProductDto.fileIds),
        });
        product.files = files;
      } else {
        product.files = [];
      }
    }

    // Handle type association
    if (updateProductDto.typeId) {
      product.type = await this.typesRepository.findOne({
        where: { id: updateProductDto.typeId },
      });
    }

    // Handle collections
    if (updateProductDto.collectionIds !== undefined) {
      if (updateProductDto.collectionIds.length > 0) {
        const collections = await this.collectionsRepository.findBy({
          id: In(updateProductDto.collectionIds),
        });
        product.collections = collections;
      } else {
        product.collections = [];
      }
    }

    // Handle amenities
    if (updateProductDto.amenityIds !== undefined) {
      if (updateProductDto.amenityIds.length > 0) {
        const amenities = await this.amenitiesRepository.findBy({
          id: In(updateProductDto.amenityIds),
        });
        product.amenities = amenities;
      } else {
        product.amenities = [];
      }
    }

    const productCommission = await this.productCommissionRepository.findOne({
      where: { product: { id: product.id } },
    });

    if (!productCommission) {
      product.commission = this.productCommissionRepository.create({
        percentage: 0,
        product,
        partner: { id: updateProductDto.partnerId },
      });
    }

    // Remove fileIds from the DTO before assigning to avoid TypeORM issues
    const { fileIds, variants, ...updateData } = updateProductDto;
    console.log('Update data before assignment:', updateData);
    console.log('embedMapUrl in updateData:', updateData.embedMapUrl);
    Object.assign(product, updateData);
    console.log('Product after assignment:', product);

    const savedProduct = await this.productsRepository.save(product);

    if (variants !== undefined) {
      console.log('Processing variants:', variants);
      for (const variantDto of variants) {
        console.log('Processing variant:', variantDto);
        if (variantDto.id) {
          if ((variantDto as any)._delete) {
            // soft delete variant
            console.log('Deleting variant:', variantDto.id);
            await this.productVariantsService.remove(variantDto.id);
          } else {
            // update existing variant
            console.log('Updating variant:', variantDto.id);
            await this.productVariantsService.update(
              variantDto.id,
              variantDto as UpdateProductVariantDto
            );
          }
        } else {
          // create new variant
          console.log('Creating new variant');
          await this.productVariantsService.create({
            ...variantDto,
            productId: savedProduct.id,
          });
        }
      }
    }
    return this.findOne(savedProduct.id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.softRemove(product);
  }

  async restore(id: string): Promise<void> {
    await this.productsRepository.restore(id);
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
        await this.productsRepository.restore({ id: In(ids) });
        break;
      case "delete":
        await this.productsRepository.softDelete({ id: In(ids) });
        break;
      default:
        await this.productsRepository.update({ id: In(ids) }, { status: status as EntityStatus });
        break;
    }

    const updated = await this.productsRepository.find({
      where: { id: In(ids) },
      relations: ["files", "collection", "type", "amenities", "variants"],
    });

    return {
      status: "success",
      message: "Products updated successfully",
      items: updated.map(toProductResource),
    };
  }
}
