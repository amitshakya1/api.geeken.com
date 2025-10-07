import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1758437853163 implements MigrationInterface {
    name = 'InitialMigration1758437853163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."blog_categories_status_enum" AS ENUM('draft', 'active', 'archived')`);
        await queryRunner.query(`CREATE TABLE "blog_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "status" "public"."blog_categories_status_enum" NOT NULL DEFAULT 'draft', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, CONSTRAINT "UQ_adc3bc773ccf2fb6f073193fcf6" UNIQUE ("name"), CONSTRAINT "PK_1056d6faca26b9957f5d26e6572" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "blogs_categories_blog_categories" ("blogsId" uuid NOT NULL, "blogCategoriesId" uuid NOT NULL, CONSTRAINT "PK_12e38a460c62773f529e88c2406" PRIMARY KEY ("blogsId", "blogCategoriesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5656bd71a26842dd03ad466a95" ON "blogs_categories_blog_categories" ("blogsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_62756b0e2e2f815cd6e055be5a" ON "blogs_categories_blog_categories" ("blogCategoriesId") `);
        await queryRunner.query(`ALTER TABLE "blog_categories" ADD CONSTRAINT "FK_174f5f4489f43c234675a30fc03" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blogs_categories_blog_categories" ADD CONSTRAINT "FK_5656bd71a26842dd03ad466a951" FOREIGN KEY ("blogsId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "blogs_categories_blog_categories" ADD CONSTRAINT "FK_62756b0e2e2f815cd6e055be5a3" FOREIGN KEY ("blogCategoriesId") REFERENCES "blog_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs_categories_blog_categories" DROP CONSTRAINT "FK_62756b0e2e2f815cd6e055be5a3"`);
        await queryRunner.query(`ALTER TABLE "blogs_categories_blog_categories" DROP CONSTRAINT "FK_5656bd71a26842dd03ad466a951"`);
        await queryRunner.query(`ALTER TABLE "blog_categories" DROP CONSTRAINT "FK_174f5f4489f43c234675a30fc03"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_62756b0e2e2f815cd6e055be5a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5656bd71a26842dd03ad466a95"`);
        await queryRunner.query(`DROP TABLE "blogs_categories_blog_categories"`);
        await queryRunner.query(`DROP TABLE "blog_categories"`);
        await queryRunner.query(`DROP TYPE "public"."blog_categories_status_enum"`);
    }

}
