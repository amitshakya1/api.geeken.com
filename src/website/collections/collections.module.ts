import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollectionsService } from "./collections.service";
import { CollectionsController } from "./collections.controller";
import { Collection } from "../../common/entities/collection.entity";
import { File } from "../../common/entities/file.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Collection, File])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionsModule { }
