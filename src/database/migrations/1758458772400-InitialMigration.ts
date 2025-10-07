import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1758458772400 implements MigrationInterface {
    name = 'InitialMigration1758458772400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "blog_category_blogs" ("blog_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_8b27988f5cb54c424c2937dd45b" PRIMARY KEY ("blog_id", "category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1a3691d092084949759667def9" ON "blog_category_blogs" ("blog_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e92ce4c5907e44d56c6de1bb5f" ON "blog_category_blogs" ("category_id") `);
        await queryRunner.query(`ALTER TABLE "blog_category_blogs" ADD CONSTRAINT "FK_1a3691d092084949759667def9a" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "blog_category_blogs" ADD CONSTRAINT "FK_e92ce4c5907e44d56c6de1bb5f3" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog_category_blogs" DROP CONSTRAINT "FK_e92ce4c5907e44d56c6de1bb5f3"`);
        await queryRunner.query(`ALTER TABLE "blog_category_blogs" DROP CONSTRAINT "FK_1a3691d092084949759667def9a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e92ce4c5907e44d56c6de1bb5f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1a3691d092084949759667def9"`);
        await queryRunner.query(`DROP TABLE "blog_category_blogs"`);
    }

}
