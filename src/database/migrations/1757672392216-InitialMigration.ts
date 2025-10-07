import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1757672392216 implements MigrationInterface {
    name = 'InitialMigration1757672392216'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "imageId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_0b9cf86bd47b4393165e9bddf3c" FOREIGN KEY ("imageId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_0b9cf86bd47b4393165e9bddf3c"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "imageId"`);
    }

}
