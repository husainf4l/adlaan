import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDefaultUserRole1760871537353 implements MigrationInterface {
    name = 'UpdateDefaultUserRole1760871537353'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."client_type_enum" AS ENUM('individual', 'organization')`);
        await queryRunner.query(`CREATE TABLE "client" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" "public"."client_type_enum" NOT NULL DEFAULT 'individual', "email" character varying, "phone" character varying, "address" text, "contactPerson" character varying, "taxId" character varying, "notes" text, "companyId" integer NOT NULL, "createdById" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."case_status_enum" AS ENUM('active', 'pending', 'closed', 'archived', 'on_hold')`);
        await queryRunner.query(`CREATE TYPE "public"."case_casetype_enum" AS ENUM('litigation', 'corporate', 'intellectual_property', 'real_estate', 'family_law', 'criminal', 'tax', 'employment', 'immigration', 'bankruptcy', 'other')`);
        await queryRunner.query(`CREATE TABLE "case" ("id" SERIAL NOT NULL, "caseNumber" character varying NOT NULL, "title" character varying NOT NULL, "description" text, "status" "public"."case_status_enum" NOT NULL DEFAULT 'active', "caseType" "public"."case_casetype_enum" NOT NULL, "court" character varying, "opposingParty" character varying, "filingDate" date, "closingDate" date, "notes" text, "clientId" integer NOT NULL, "companyId" integer NOT NULL, "createdById" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_02091369935294774e41d4acf24" UNIQUE ("caseNumber"), CONSTRAINT "PK_a1b20a2aef6fc438389d2c4aca0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."document_documenttype_enum" AS ENUM('contract', 'nda', 'motion', 'brief', 'lease', 'memo', 'letter', 'agreement', 'power_of_attorney', 'will', 'complaint', 'answer', 'discovery', 'affidavit', 'summons', 'order', 'judgment', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."document_status_enum" AS ENUM('draft', 'review', 'approved', 'signed', 'filed', 'archived')`);
        await queryRunner.query(`CREATE TABLE "document" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text, "content" text, "fileUrl" character varying, "documentType" "public"."document_documenttype_enum" NOT NULL DEFAULT 'other', "status" "public"."document_status_enum" NOT NULL DEFAULT 'draft', "version" integer NOT NULL DEFAULT '1', "caseId" integer, "clientId" integer, "companyId" integer NOT NULL, "createdById" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tag" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "color" character varying, "description" text, "companyId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "document_version" ("id" SERIAL NOT NULL, "documentId" integer NOT NULL, "versionNumber" integer NOT NULL, "title" character varying NOT NULL, "content" text, "fileUrl" character varying, "changeDescription" text, "createdById" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a4c39c95456c5dbb2e96cca713c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "documentId" integer NOT NULL, "content" text NOT NULL, "parentId" integer, "position" integer, "mentions" text, "quotedText" text, "resolved" boolean NOT NULL DEFAULT false, "resolvedById" integer, "resolvedAt" TIMESTAMP, "createdById" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "case_assigned_users" ("caseId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_1c4282af89ebe98d8641450d5c9" PRIMARY KEY ("caseId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4af0a9c801abd0a92f9c2bff70" ON "case_assigned_users" ("caseId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7bd38459daee7a139c2b96ef26" ON "case_assigned_users" ("userId") `);
        await queryRunner.query(`CREATE TABLE "document_tags" ("documentId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_5b662ef9a9b76508d84aa6b1e44" PRIMARY KEY ("documentId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1f87f7b4ec76661b26ce44dd78" ON "document_tags" ("documentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_abea3d41e67e47e125726fde4b" ON "document_tags" ("tagId") `);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "client" ADD CONSTRAINT "FK_3d7a0b6e0f1d0c0ab1bc189645f" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client" ADD CONSTRAINT "FK_9477be4254050dbbdc6c7baa071" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "case" ADD CONSTRAINT "FK_49ee1581a61078e3eb5f016b588" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "case" ADD CONSTRAINT "FK_f59d9f2fc5da9b854230e84e660" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "case" ADD CONSTRAINT "FK_dd65e7402357f088fb88d41de5d" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_95733fe5ae1c7bb106252554ba5" FOREIGN KEY ("caseId") REFERENCES "case"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_ba81651e4c4251969ba7bcbd1bc" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_ba3e67f852e763b7b7dbd741877" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_9eac3612452020c976207f37b03" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag" ADD CONSTRAINT "FK_7a0e90c9d996af4d4e233dbc664" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_version" ADD CONSTRAINT "FK_798ac949e0d25e76695ffc7776a" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_version" ADD CONSTRAINT "FK_0a245cd17ebaa45ff65d8a00463" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_59ed5f8da9154251dbba55f4859" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_e3aebe2bd1c53467a07109be596" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_c9409c81aa283c1aae70fd5f4c3" FOREIGN KEY ("resolvedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_63ac916757350d28f05c5a6a4ba" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "case_assigned_users" ADD CONSTRAINT "FK_4af0a9c801abd0a92f9c2bff707" FOREIGN KEY ("caseId") REFERENCES "case"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "case_assigned_users" ADD CONSTRAINT "FK_7bd38459daee7a139c2b96ef26c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "document_tags" ADD CONSTRAINT "FK_1f87f7b4ec76661b26ce44dd783" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "document_tags" ADD CONSTRAINT "FK_abea3d41e67e47e125726fde4b1" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_tags" DROP CONSTRAINT "FK_abea3d41e67e47e125726fde4b1"`);
        await queryRunner.query(`ALTER TABLE "document_tags" DROP CONSTRAINT "FK_1f87f7b4ec76661b26ce44dd783"`);
        await queryRunner.query(`ALTER TABLE "case_assigned_users" DROP CONSTRAINT "FK_7bd38459daee7a139c2b96ef26c"`);
        await queryRunner.query(`ALTER TABLE "case_assigned_users" DROP CONSTRAINT "FK_4af0a9c801abd0a92f9c2bff707"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_63ac916757350d28f05c5a6a4ba"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_c9409c81aa283c1aae70fd5f4c3"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_e3aebe2bd1c53467a07109be596"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_59ed5f8da9154251dbba55f4859"`);
        await queryRunner.query(`ALTER TABLE "document_version" DROP CONSTRAINT "FK_0a245cd17ebaa45ff65d8a00463"`);
        await queryRunner.query(`ALTER TABLE "document_version" DROP CONSTRAINT "FK_798ac949e0d25e76695ffc7776a"`);
        await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "FK_7a0e90c9d996af4d4e233dbc664"`);
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_9eac3612452020c976207f37b03"`);
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_ba3e67f852e763b7b7dbd741877"`);
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_ba81651e4c4251969ba7bcbd1bc"`);
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_95733fe5ae1c7bb106252554ba5"`);
        await queryRunner.query(`ALTER TABLE "case" DROP CONSTRAINT "FK_dd65e7402357f088fb88d41de5d"`);
        await queryRunner.query(`ALTER TABLE "case" DROP CONSTRAINT "FK_f59d9f2fc5da9b854230e84e660"`);
        await queryRunner.query(`ALTER TABLE "case" DROP CONSTRAINT "FK_49ee1581a61078e3eb5f016b588"`);
        await queryRunner.query(`ALTER TABLE "client" DROP CONSTRAINT "FK_9477be4254050dbbdc6c7baa071"`);
        await queryRunner.query(`ALTER TABLE "client" DROP CONSTRAINT "FK_3d7a0b6e0f1d0c0ab1bc189645f"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_abea3d41e67e47e125726fde4b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f87f7b4ec76661b26ce44dd78"`);
        await queryRunner.query(`DROP TABLE "document_tags"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7bd38459daee7a139c2b96ef26"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4af0a9c801abd0a92f9c2bff70"`);
        await queryRunner.query(`DROP TABLE "case_assigned_users"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "document_version"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`DROP TABLE "document"`);
        await queryRunner.query(`DROP TYPE "public"."document_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."document_documenttype_enum"`);
        await queryRunner.query(`DROP TABLE "case"`);
        await queryRunner.query(`DROP TYPE "public"."case_casetype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."case_status_enum"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`DROP TYPE "public"."client_type_enum"`);
    }

}
