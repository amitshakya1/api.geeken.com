import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1757659819906 implements MigrationInterface {
    name = 'InitialMigration1757659819906'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "discount_collections" ("discountId" uuid NOT NULL, "collectionId" uuid NOT NULL, CONSTRAINT "PK_6deafe984b6b54e3e5b137b5594" PRIMARY KEY ("discountId", "collectionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c67a8d78ce509d7d55755492f4" ON "discount_collections" ("discountId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a9adb8688b814785adc7fb0092" ON "discount_collections" ("collectionId") `);
        await queryRunner.query(`ALTER TABLE "discounts" DROP COLUMN "isFeatured"`);
        await queryRunner.query(`ALTER TABLE "discounts" DROP COLUMN "uptoDiscount"`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD "isMaximumDiscountValue" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD "isUsageLimitPerUser" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD "usageLimitPerUser" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD "isAutoApply" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "discount_collections" ADD CONSTRAINT "FK_c67a8d78ce509d7d55755492f41" FOREIGN KEY ("discountId") REFERENCES "discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "discount_collections" ADD CONSTRAINT "FK_a9adb8688b814785adc7fb00925" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discount_collections" DROP CONSTRAINT "FK_a9adb8688b814785adc7fb00925"`);
        await queryRunner.query(`ALTER TABLE "discount_collections" DROP CONSTRAINT "FK_c67a8d78ce509d7d55755492f41"`);
        await queryRunner.query(`ALTER TABLE "discounts" DROP COLUMN "isAutoApply"`);
        await queryRunner.query(`ALTER TABLE "discounts" DROP COLUMN "usageLimitPerUser"`);
        await queryRunner.query(`ALTER TABLE "discounts" DROP COLUMN "isUsageLimitPerUser"`);
        await queryRunner.query(`ALTER TABLE "discounts" DROP COLUMN "isMaximumDiscountValue"`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD "uptoDiscount" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD "isFeatured" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9adb8688b814785adc7fb0092"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c67a8d78ce509d7d55755492f4"`);
        await queryRunner.query(`DROP TABLE "discount_collections"`);
    }

}
