import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1757927383123 implements MigrationInterface {
    name = 'InitialMigration1757927383123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "tags" text array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "tags"`);
    }

}
