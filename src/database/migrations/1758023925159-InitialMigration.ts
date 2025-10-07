import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1758023925159 implements MigrationInterface {
    name = 'InitialMigration1758023925159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_a000cca60bcf04454e727699490"`);
        await queryRunner.query(`ALTER TABLE "discounts" DROP COLUMN "usageLimitPerUser"`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD "usageLimitPerUser" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discounts" DROP COLUMN "usageLimitPerUser"`);
        await queryRunner.query(`ALTER TABLE "discounts" ADD "usageLimitPerUser" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone")`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
    }

}
