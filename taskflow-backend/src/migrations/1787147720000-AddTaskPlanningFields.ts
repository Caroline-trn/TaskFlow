import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskPlanningFields1787147720000 implements MigrationInterface {
  name = 'AddTaskPlanningFields1787147720000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" ADD "dueDate" date`);
    await queryRunner.query(`ALTER TABLE "task" ADD "archived" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "archived"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "dueDate"`);
  }
}
