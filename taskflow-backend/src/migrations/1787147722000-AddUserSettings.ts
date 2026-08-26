import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserSettings1787147722000 implements MigrationInterface {
  name = 'AddUserSettings1787147722000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "notificationsEnabled" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "user" ADD "darkMode" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "darkMode"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "notificationsEnabled"`);
  }
}
