import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765207405707 implements MigrationInterface {
    name = 'Migration1765207405707'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "payments" ("id" character varying NOT NULL, "userId" character varying, "stripeCustomerId" character varying, "stripeSubscriptionId" character varying, "provider" character varying NOT NULL, "amount" integer, "currency" character varying, "status" character varying NOT NULL DEFAULT 'pending', "url" character varying, "invoiceUrl" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "paidAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "payments"`);
    }

}
