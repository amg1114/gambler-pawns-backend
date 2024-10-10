import { MigrationInterface, QueryRunner } from "typeorm";

export class GameEntityMissedAndTimecolumns1728562635261 implements MigrationInterface {
    name = 'GameEntityMissedAndTimecolumns1728562635261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" ADD "time_after_game_end_whites" smallint`);
        await queryRunner.query(`ALTER TABLE "game" ADD "time_after_game_end_blacks" smallint`);
        await queryRunner.query(`ALTER TYPE "public"."game_winner_enum" RENAME TO "game_winner_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."game_winner_enum" AS ENUM('w', 'b', 'draw')`);
        await queryRunner.query(`ALTER TABLE "game" ALTER COLUMN "winner" TYPE "public"."game_winner_enum" USING "winner"::"text"::"public"."game_winner_enum"`);
        await queryRunner.query(`DROP TYPE "public"."game_winner_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."game_winner_enum_old" AS ENUM('White', 'Black', 'Draw')`);
        await queryRunner.query(`ALTER TABLE "game" ALTER COLUMN "winner" TYPE "public"."game_winner_enum_old" USING "winner"::"text"::"public"."game_winner_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."game_winner_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."game_winner_enum_old" RENAME TO "game_winner_enum"`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "time_after_game_end_blacks"`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "time_after_game_end_whites"`);
    }

}
