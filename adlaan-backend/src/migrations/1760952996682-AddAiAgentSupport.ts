import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiAgentSupport1760952996682 implements MigrationInterface {
    name = 'AddAiAgentSupport1760952996682'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."agent_tasks_type_enum" AS ENUM('LEGAL_DOCUMENT_GENERATOR', 'DOCUMENT_ANALYZER', 'DOCUMENT_CLASSIFIER')`);
        await queryRunner.query(`CREATE TYPE "public"."agent_tasks_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "agent_tasks" ("id" SERIAL NOT NULL, "type" "public"."agent_tasks_type_enum" NOT NULL, "status" "public"."agent_tasks_status_enum" NOT NULL DEFAULT 'PENDING', "input" text NOT NULL, "output" text, "errorMessage" text, "metadata" jsonb, "caseId" integer, "documentId" integer, "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "completedAt" TIMESTAMP, CONSTRAINT "PK_0dd9472bb57b7ab7d0a5cd1f20b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "document" ADD "isAiGenerated" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "document" ADD "aiSummary" text`);
        await queryRunner.query(`ALTER TABLE "document" ADD "aiClassification" character varying`);
        await queryRunner.query(`ALTER TABLE "document" ADD "aiMetadata" jsonb`);
        await queryRunner.query(`ALTER TABLE "document" ADD "aiConfidenceScore" numeric(5,4)`);
        await queryRunner.query(`ALTER TABLE "agent_tasks" ADD CONSTRAINT "FK_dbca88792549bc4a75c47b837d2" FOREIGN KEY ("caseId") REFERENCES "case"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agent_tasks" ADD CONSTRAINT "FK_fcfb12e7bfdc071ca4dbfb1b5d3" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "agent_tasks" ADD CONSTRAINT "FK_e92a969ae1a8dac9ef71dadb0aa" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "agent_tasks" DROP CONSTRAINT "FK_e92a969ae1a8dac9ef71dadb0aa"`);
        await queryRunner.query(`ALTER TABLE "agent_tasks" DROP CONSTRAINT "FK_fcfb12e7bfdc071ca4dbfb1b5d3"`);
        await queryRunner.query(`ALTER TABLE "agent_tasks" DROP CONSTRAINT "FK_dbca88792549bc4a75c47b837d2"`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "aiConfidenceScore"`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "aiMetadata"`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "aiClassification"`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "aiSummary"`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "isAiGenerated"`);
        await queryRunner.query(`DROP TABLE "agent_tasks"`);
        await queryRunner.query(`DROP TYPE "public"."agent_tasks_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."agent_tasks_type_enum"`);
    }

}
