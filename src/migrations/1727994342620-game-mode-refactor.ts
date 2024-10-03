import { MigrationInterface, QueryRunner } from "typeorm";

export class GameModeRefactor1727994342620 implements MigrationInterface {
    name = 'GameModeRefactor1727994342620'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP CONSTRAINT "FK_c0271687f22dd2f85c6a923a3c7"`);
        await queryRunner.query(`ALTER TABLE "game" RENAME COLUMN "game_mode_game_mode_id" TO "game_mode"`);
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "game_mode"`);
        await queryRunner.query(`CREATE TYPE "public"."game_game_mode_enum" AS ENUM('rapid', 'blitz', 'bullet', 'arcade')`);
        await queryRunner.query(`ALTER TABLE "game" ADD "game_mode" "public"."game_game_mode_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game" DROP COLUMN "game_mode"`);
        await queryRunner.query(`DROP TYPE "public"."game_game_mode_enum"`);
        await queryRunner.query(`ALTER TABLE "game" ADD "game_mode" smallint`);
        await queryRunner.query(`ALTER TABLE "game" RENAME COLUMN "game_mode" TO "game_mode_game_mode_id"`);
        await queryRunner.query(`ALTER TABLE "game" ADD CONSTRAINT "FK_c0271687f22dd2f85c6a923a3c7" FOREIGN KEY ("game_mode_game_mode_id") REFERENCES "game_mode"("game_mode_id") ON DELETE NO ACTION ON UPDATE CASCADE`);
    }

}
