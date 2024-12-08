import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtToUsers1733675874029 implements MigrationInterface {
    name = 'AddDeletedAtToUsers1733675874029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    }

}
