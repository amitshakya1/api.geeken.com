import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EnquiriesService } from "./enquiries.service";
import { EnquiriesController } from "./enquiries.controller";
import { Enquiry } from "../../common/entities/enquiry.entity";
import { File } from "../../common/entities/file.entity";
import { EnquiryReply } from "../../common/entities/enquiry-reply.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Enquiry, File, EnquiryReply])],
  controllers: [EnquiriesController],
  providers: [EnquiriesService],
  exports: [EnquiriesService],
})
export class EnquiriesModule { }
