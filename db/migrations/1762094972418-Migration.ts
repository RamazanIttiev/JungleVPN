import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1762094972418 implements MigrationInterface {
    name = 'Migration1762094972418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "url"`);
    }

}
