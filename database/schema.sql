CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  CREATE TYPE "public"."task_status_enum" AS ENUM ('en_attente', 'en_cours', 'terminee');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "public"."task_priority_enum" AS ENUM ('basse', 'moyenne', 'haute');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "user" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "email" character varying NOT NULL,
  "password" character varying NOT NULL,
  "name" character varying NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "notificationsEnabled" boolean NOT NULL DEFAULT true,
  "darkMode" boolean NOT NULL DEFAULT false,
  "resetTokenHash" character varying,
  "resetTokenExpiresAt" timestamp,
  CONSTRAINT "PK_user" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_user_email" UNIQUE ("email")
);

CREATE TABLE IF NOT EXISTS "task" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "title" character varying NOT NULL,
  "description" character varying,
  "status" "public"."task_status_enum" NOT NULL DEFAULT 'en_attente',
  "priority" "public"."task_priority_enum" NOT NULL DEFAULT 'moyenne',
  "user_id" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "dueDate" date,
  "archived" boolean NOT NULL DEFAULT false,
  CONSTRAINT "PK_task" PRIMARY KEY ("id"),
  CONSTRAINT "FK_task_user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "workspace_project" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" character varying NOT NULL,
  "user_id" uuid NOT NULL,
  CONSTRAINT "PK_workspace_project" PRIMARY KEY ("id"),
  CONSTRAINT "FK_workspace_project_user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "workspace_member" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" character varying NOT NULL,
  "user_id" uuid NOT NULL,
  CONSTRAINT "PK_workspace_member" PRIMARY KEY ("id"),
  CONSTRAINT "FK_workspace_member_user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);
