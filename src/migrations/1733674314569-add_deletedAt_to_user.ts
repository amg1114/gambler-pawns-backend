import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtToUser1733674314569 implements MigrationInterface {
    name = 'AddDeletedAtToUser1733674314569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
    }

}
