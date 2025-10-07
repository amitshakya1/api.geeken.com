import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1757925545966 implements MigrationInterface {
    name = 'InitialMigration1757925545966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "embedMapUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "embedMapUrl"`);
    }

}
