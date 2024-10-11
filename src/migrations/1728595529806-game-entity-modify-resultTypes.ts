import { MigrationInterface, QueryRunner } from "typeorm";

export class GameEntityModifyResultTypes1728595529806 implements MigrationInterface {
    name = 'GameEntityModifyResultTypes1728595529806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."game_result_type_enum" RENAME TO "game_result_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."game_result_type_enum" AS ENUM('Check Mate', 'On Time', 'Stalemate', 'Resign', 'Abandon', '50 Moves Rule', 'Stalesmate', 'Threefold Repetition', 'Insufficient Material', 'Draw Offer')`);
        await queryRunner.query(`ALTER TABLE "game" ALTER COLUMN "result_type" TYPE "public"."game_result_type_enum" USING "result_type"::"text"::"public"."game_result_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."game_result_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."game_result_type_enum_old" AS ENUM('On Time', 'Draw offer', 'Abandon', 'Resign', 'Stalemate', 'N Moves Rule', 'Check Mate')`);
        await queryRunner.query(`ALTER TABLE "game" ALTER COLUMN "result_type" TYPE "public"."game_result_type_enum_old" USING "result_type"::"text"::"public"."game_result_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."game_result_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."game_result_type_enum_old" RENAME TO "game_result_type_enum"`);
    }

}
