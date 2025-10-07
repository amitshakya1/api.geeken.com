import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { ProductVariant } from "../../common/entities/product-variant.entity";
import { Product } from "../../common/entities/product.entity";
import { File } from "../../common/entities/file.entity";
import { CreateProductVariantDto } from "./dto/create-product-variant.dto";
import { UpdateProductVariantDto } from "./dto/update-product-variant.dto";
import { ProductVariantResource } from "./product-variant.resource";
import { EntityStatus } from "../../common/enums/status.enum";
import { Amenity } from "../../common/entities/amenity.entity";

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Amenity)
    private amenitiesRepository: Repository<Amenity>,
    @InjectRepository(File)
    private filesRepository: Repository<File>
  ) { }

  async create(createProductVariantDto: CreateProductVariantDto): Promise<any> {
    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: createProductVariantDto.productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Check if title is unique within the product
    const existingVariant = await this.productVariantRepository.findOne({
      where: {
        productId: createProductVariantDto.productId,
        name: createProductVariantDto.name,
      },
    });

    if (existingVariant) {
      throw new BadRequestException(
        "Variant title must be unique within the product"
      );
    }

    const variant = this.productVariantRepository.create({
      ...createProductVariantDto,
      currency: createProductVariantDto.currency || "INR",
    });

    if (
      createProductVariantDto.amenityIds &&
      createProductVariantDto.amenityIds.length > 0
    ) {
      const amenities = await this.amenitiesRepository.findBy({
        id: In(createProductVariantDto.amenityIds),
      });
      variant.amenities = amenities;
    }

    // Handle file associations
    if (
      createProductVariantDto.fileIds &&
      createProductVariantDto.fileIds.length > 0
    ) {
      const files = await this.filesRepository.findBy({
        id: In(createProductVariantDto.fileIds),
      });
      variant.files = files;
    }

    const savedVariant = await this.productVariantRepository.save(variant);
    return this.findOne(savedVariant.id);
  }

  async findAll(productId?: string): Promise<any> {
    const query = this.productVariantRepository
      .createQueryBuilder("variant")
      .leftJoinAndSelect("variant.product", "product")
      .leftJoinAndSelect("variant.files", "files")
      .leftJoinAndSelect("variant.amenities", "amenities")
      .where("variant.status != :status", { status: EntityStatus.ARCHIVED });

    if (productId) {
      query.andWhere("variant.productId = :productId", { productId });
    }

    const variants = await query.orderBy("variant.createdAt", "DESC").getMany();
    return ProductVariantResource.toArray(variants);
  }

  async findOne(id: string): Promise<any> {
    const variant = await this.productVariantRepository.findOne({
      where: { id },
      relations: ["product", "files", "amenities"],
    });

    if (!variant) {
      throw new NotFoundException("Product variant not found");
    }

    return ProductVariantResource.toObject(variant);
  }

  async findByProductId(productId: string): Promise<any> {
    const variants = await this.productVariantRepository.find({
      where: {
        productId,
        status: EntityStatus.ACTIVE,
      },
      order: { createdAt: "ASC" },
    });
    return ProductVariantResource.toArray(variants);
  }

  async update(
    id: string,
    updateProductVariantDto: UpdateProductVariantDto
  ): Promise<any> {
    console.log("ProductVariantsService.update called with:", {
      id,
      updateProductVariantDto,
    });

    const variant = await this.productVariantRepository.findOne({
      where: { id },
      relations: ["product", "files", "amenities"],
    });

    if (!variant) {
      throw new NotFoundException("Product variant not found");
    }

    console.log("Found variant:", variant);

    // Handle amenities associations
    if (updateProductVariantDto.amenityIds !== undefined) {
      console.log("Processing amenityIds:", updateProductVariantDto.amenityIds);
      if (
        updateProductVariantDto.amenityIds &&
        updateProductVariantDto.amenityIds.length > 0
      ) {
        const amenities = await this.amenitiesRepository.findBy({
          id: In(updateProductVariantDto.amenityIds),
        });
        console.log("Found amenities:", amenities);
        variant.amenities = amenities;
      } else {
        variant.amenities = [];
      }
    }

    // Handle file associations
    if (updateProductVariantDto.fileIds !== undefined) {
      console.log("Processing fileIds:", updateProductVariantDto.fileIds);
      const files =
        updateProductVariantDto.fileIds &&
          updateProductVariantDto.fileIds.length > 0
          ? await this.filesRepository.findBy({
            id: In(updateProductVariantDto.fileIds),
          })
          : [];
      console.log("Found files:", files);
      variant.files = files;
    }

    // Remove fileIds and amenityIds from the update data since we handle them separately
    const { fileIds, amenityIds, ...updateData } = updateProductVariantDto;
    console.log(
      "Update data after removing fileIds and amenityIds:",
      updateData
    );

    // Update the variant with the new data
    Object.assign(variant, updateData);

    // Save the variant with all updates (including files and amenities)
    console.log("Saving variant:", variant);
    await this.productVariantRepository.save(variant);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const variant = await this.productVariantRepository.findOne({
      where: { id },
      relations: ["product", "files", "amenities"],
    });

    if (!variant) {
      throw new NotFoundException("Product variant not found");
    }

    // Default variant handling removed; simply soft delete

    await this.productVariantRepository.softDelete(id);
  }

  async updateStock(id: string, quantity: number): Promise<any> {
    const variant = await this.productVariantRepository.findOne({
      where: { id },
      relations: ["product", "files", "amenities"],
    });

    if (!variant) {
      throw new NotFoundException("Product variant not found");
    }

    // Stock fields are not supported anymore; return current variant without changes
    return ProductVariantResource.toObject(variant);
  }

  async setDefault(id: string): Promise<any> {
    const variant = await this.productVariantRepository.findOne({
      where: { id },
      relations: ["product", "files", "amenities"],
    });

    if (!variant) {
      throw new NotFoundException("Product variant not found");
    }

    // Default variant is not supported anymore
    throw new BadRequestException("Default variant is not supported");
  }

  async updateStatus(id: string, status: EntityStatus): Promise<any> {
    await this.productVariantRepository.update(id, { status });
    return this.findOne(id);
  }
}
