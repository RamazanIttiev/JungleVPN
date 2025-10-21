import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1761059852988 implements MigrationInterface {
    name = 'Migration1761059852988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" character varying NOT NULL, "expiryTime" character varying, "status" character varying NOT NULL DEFAULT 'active', "clients" jsonb, "first_name" character varying, "username" character varying, "language_code" character varying, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" character varying NOT NULL, "userId" character varying, "provider" character varying NOT NULL, "amount" character varying NOT NULL, "currency" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "paidAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
