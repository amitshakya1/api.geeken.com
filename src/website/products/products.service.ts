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


  async findAll(paginationDto: PaginationDto): Promise<any> {
    return this.findProductsWithFilters(paginationDto, false);
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

    queryBuilder.andWhere("product.status = :status", { status: EntityStatus.ACTIVE });

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

  async findOne(slug: string): Promise<any> {
    const product = await this.productsRepository.findOne({
      where: { slug, status: EntityStatus.ACTIVE },
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

}
