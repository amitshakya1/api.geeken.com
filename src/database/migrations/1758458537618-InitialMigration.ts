import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1758458537618 implements MigrationInterface {
    name = 'InitialMigration1758458537618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."blogs_categories_status_enum" AS ENUM('draft', 'active', 'archived')`);
        await queryRunner.query(`CREATE TABLE "blogs_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "status" "public"."blogs_categories_status_enum" NOT NULL DEFAULT 'draft', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, CONSTRAINT "UQ_e96613bdb43899dd10dd7884b6f" UNIQUE ("name"), CONSTRAINT "PK_dcd13d47e7321fd8f5b4b75c732" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "blogs_categories_blogs_categories" ("blogsId" uuid NOT NULL, "blogsCategoriesId" uuid NOT NULL, CONSTRAINT "PK_d539bc52a35483cd94eea00bf5a" PRIMARY KEY ("blogsId", "blogsCategoriesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3d5ec3fdbbad75b3f91ef5d37f" ON "blogs_categories_blogs_categories" ("blogsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_72fb51668663f4e8ab99e2eab6" ON "blogs_categories_blogs_categories" ("blogsCategoriesId") `);
        await queryRunner.query(`ALTER TABLE "blogs_categories" ADD CONSTRAINT "FK_fc915e10854d880d90f3fb488f2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blogs_categories_blogs_categories" ADD CONSTRAINT "FK_3d5ec3fdbbad75b3f91ef5d37f5" FOREIGN KEY ("blogsId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "blogs_categories_blogs_categories" ADD CONSTRAINT "FK_72fb51668663f4e8ab99e2eab6f" FOREIGN KEY ("blogsCategoriesId") REFERENCES "blogs_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs_categories_blogs_categories" DROP CONSTRAINT "FK_72fb51668663f4e8ab99e2eab6f"`);
        await queryRunner.query(`ALTER TABLE "blogs_categories_blogs_categories" DROP CONSTRAINT "FK_3d5ec3fdbbad75b3f91ef5d37f5"`);
        await queryRunner.query(`ALTER TABLE "blogs_categories" DROP CONSTRAINT "FK_fc915e10854d880d90f3fb488f2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_72fb51668663f4e8ab99e2eab6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d5ec3fdbbad75b3f91ef5d37f"`);
        await queryRunner.query(`DROP TABLE "blogs_categories_blogs_categories"`);
        await queryRunner.query(`DROP TABLE "blogs_categories"`);
        await queryRunner.query(`DROP TYPE "public"."blogs_categories_status_enum"`);
    }

}
