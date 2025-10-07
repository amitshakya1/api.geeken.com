import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1758460288090 implements MigrationInterface {
    name = 'InitialMigration1758460288090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."enquiries_status_enum" RENAME TO "enquiries_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."enquiries_status_enum" AS ENUM('new', 'assigned', 'in_progress', 'follow_up', 'converted', 'rejected', 'closed')`);
        await queryRunner.query(`ALTER TABLE "enquiries" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "enquiries" ALTER COLUMN "status" TYPE "public"."enquiries_status_enum" USING "status"::"text"::"public"."enquiries_status_enum"`);
        await queryRunner.query(`ALTER TABLE "enquiries" ALTER COLUMN "status" SET DEFAULT 'new'`);
        await queryRunner.query(`DROP TYPE "public"."enquiries_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."enquiries_status_enum_old" AS ENUM('new', 'assigned', 'in progress', 'follow up', 'converted', 'rejected', 'closed')`);
        await queryRunner.query(`ALTER TABLE "enquiries" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "enquiries" ALTER COLUMN "status" TYPE "public"."enquiries_status_enum_old" USING "status"::"text"::"public"."enquiries_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "enquiries" ALTER COLUMN "status" SET DEFAULT 'new'`);
        await queryRunner.query(`DROP TYPE "public"."enquiries_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."enquiries_status_enum_old" RENAME TO "enquiries_status_enum"`);
    }

}
