import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { AdminModule } from "./admin/admin.module";
import { WebsiteModule } from "./website/website.module";

@Module({
    imports: [
        // RouterModule.register([
        //     {
        //         path: 'admin',
        //         module: AdminModule,
        //     },
        //     {
        //         path: 'website',
        //         module: WebsiteModule,
        //     },
        // ]),
        AdminModule,
        WebsiteModule,
    ],
})
export class AppModule { }