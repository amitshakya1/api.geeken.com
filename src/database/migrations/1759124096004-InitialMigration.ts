import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1759124096004 implements MigrationInterface {
    name = 'InitialMigration1759124096004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "badge" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "badge"`);
    }

}
