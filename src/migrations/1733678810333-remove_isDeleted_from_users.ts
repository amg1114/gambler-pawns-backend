import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIsDeletedFromUsers1733678810333 implements MigrationInterface {
    name = 'RemoveIsDeletedFromUsers1733678810333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_deleted"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "is_deleted" boolean NOT NULL DEFAULT false`);
    }

}
