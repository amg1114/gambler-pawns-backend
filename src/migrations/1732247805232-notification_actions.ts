import { MigrationInterface, QueryRunner } from "typeorm";

export class Notification21732247805232 implements MigrationInterface {
    name = 'Notification21732247805232'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "action_link1" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "action_text1" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "action_link2" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "action_text2" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "action_text2" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "action_link2" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "action_text1" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "action_link1" SET NOT NULL`);
    }

}
