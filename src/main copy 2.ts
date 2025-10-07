import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AdminModule } from "./admin/admin.module";
import { WebsiteModule } from "./website/website.module";
import { join } from "path";
import { ExpressAdapter } from "@nestjs/platform-express";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as express from "express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter()
  );

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Enable CORS
  app.enableCors();

  // app.setGlobalPrefix('api');

  // Serve static files
  const uploadsPath = join(__dirname, "..", "uploads");
  app.use("/uploads", express.static(uploadsPath));

  const assetsPath = join(__dirname, "..", "src/assets");
  app.use("/assets", express.static(assetsPath));

  // Base Swagger config
  const baseConfig = new DocumentBuilder()
    .setTitle("Gokaasa API")
    .setDescription("Complete API documentation for Gokaasa platform")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  // Admin Swagger config
  const adminConfig = new DocumentBuilder()
    .setTitle("Gokaasa Admin API")
    .setDescription("Admin API for backend management operations")
    .setVersion("1.0")
    .addBearerAuth()
    .addServer("/admin", "Admin Server") // 👈 servers
    .build();

  const adminDoc = SwaggerModule.createDocument(app, adminConfig, {
    include: [AdminModule],
    deepScanRoutes: true,
  });
  SwaggerModule.setup("api/admin/docs", app, adminDoc, {
    customSiteTitle: "Gokaasa Admin API Docs",
    customfavIcon: "/assets/images/logo.png",
    customCss: `
    .topbar-wrapper .link:after { content: ''; }
    .topbar-wrapper .link img {
      content: url('/assets/images/logo.png');
      height: 40px;
      width: auto;
    }
    .topbar-wrapper .link span { display: none; }
  `,
  });

  // Website Swagger config
  const websiteConfig = new DocumentBuilder()
    .setTitle("Gokaasa Website API")
    .setDescription("Public API for website operations")
    .setVersion("1.0")
    .addBearerAuth()
    .addServer("/website", "Website Server") // 👈 servers
    .build();

  const websiteDoc = SwaggerModule.createDocument(app, websiteConfig, {
    include: [WebsiteModule],
    deepScanRoutes: true,
  });
  SwaggerModule.setup("api/website/docs", app, websiteDoc, {
    customSiteTitle: "Gokaasa Website API Docs",
    customfavIcon: "/assets/images/logo.png",
    customCss: `
    .topbar-wrapper .link:after { content: ''; }
    .topbar-wrapper .link img {
      content: url('/assets/images/logo.png');
      height: 40px;
      width: auto;
    }
    .topbar-wrapper .link span { display: none; }
  `,
  });


  // Debug: Full document with everything
  const fullDoc = SwaggerModule.createDocument(app, baseConfig);
  SwaggerModule.setup("api-json", app, fullDoc);

  const port = process.env.PORT || 5002;
  await app.listen(port, "0.0.0.0");
  const appUrl = process.env.APP_URL || `http://localhost:${port}`;

  console.log(`✅ Application is running on: ${appUrl}`);
  console.log(`📘 Admin API Documentation: ${appUrl}/api/admin/docs`);
  console.log(`📘 Website API Documentation: ${appUrl}/api/website/docs`);
}
bootstrap();
