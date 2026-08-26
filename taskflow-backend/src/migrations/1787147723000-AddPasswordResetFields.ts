import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetFields1787147723000 implements MigrationInterface {
  name = 'AddPasswordResetFields1787147723000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "resetTokenHash" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "resetTokenExpiresAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetTokenExpiresAt"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetTokenHash"`);
  }
}
