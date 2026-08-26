import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceTables1787147721000 implements MigrationInterface {
  name = 'AddWorkspaceTables1787147721000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "workspace_project" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_workspace_project" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "workspace_member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_workspace_member" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "workspace_project" ADD CONSTRAINT "FK_workspace_project_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "workspace_member" ADD CONSTRAINT "FK_workspace_member_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "workspace_member" DROP CONSTRAINT "FK_workspace_member_user"`);
    await queryRunner.query(`ALTER TABLE "workspace_project" DROP CONSTRAINT "FK_workspace_project_user"`);
    await queryRunner.query(`DROP TABLE "workspace_member"`);
    await queryRunner.query(`DROP TABLE "workspace_project"`);
  }
}
