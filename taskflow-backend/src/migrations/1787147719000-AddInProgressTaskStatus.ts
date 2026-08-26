import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInProgressTaskStatus1787147719000 implements MigrationInterface {
  name = 'AddInProgressTaskStatus1787147719000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."task_status_enum" ADD VALUE IF NOT EXISTS 'en_cours'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."task_status_enum" RENAME TO "task_status_enum_old";
      CREATE TYPE "public"."task_status_enum" AS ENUM('en_attente', 'terminee');
      ALTER TABLE "task" ALTER COLUMN "status" TYPE "public"."task_status_enum"
        USING CASE WHEN "status"::text = 'en_cours' THEN 'en_attente' ELSE "status"::text END::"public"."task_status_enum";
      DROP TYPE "public"."task_status_enum_old";
    `);
  }
}
