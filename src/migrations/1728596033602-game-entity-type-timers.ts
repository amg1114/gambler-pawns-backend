import { MigrationInterface, QueryRunner } from "typeorm";

export class GameEntityTypeTimers1728596033602 implements MigrationInterface {
    name = 'GameEntityTypeTimers1728596033602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "time_after_game_end_whites"`);
        await queryRunner.query(`ALTER TABLE "game" ADD "time_after_game_end_whites" integer`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "time_after_game_end_blacks"`);
        await queryRunner.query(`ALTER TABLE "game" ADD "time_after_game_end_blacks" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "time_after_game_end_blacks"`);
        await queryRunner.query(`ALTER TABLE "game" ADD "time_after_game_end_blacks" smallint`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "time_after_game_end_whites"`);
        await queryRunner.query(`ALTER TABLE "game" ADD "time_after_game_end_whites" smallint`);
    }

}
