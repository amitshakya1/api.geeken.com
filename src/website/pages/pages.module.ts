import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagesService } from "./pages.service";
import { PagesController } from "./pages.controller";
import { Page } from "../../common/entities/page.entity";
import { File } from "../../common/entities/file.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Page, File])],
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule { }
