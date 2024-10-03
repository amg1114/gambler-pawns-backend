import { MigrationInterface, QueryRunner } from "typeorm";

export class PuzzleId1727987253015 implements MigrationInterface {
    name = 'PuzzleId1727987253015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "puzzle" ADD "lichess_id" character varying(5) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "puzzle" ADD CONSTRAINT "UQ_ea562d6373d1a208cbd97210f7a" UNIQUE ("lichess_id")`);
        await queryRunner.query(`ALTER TABLE "puzzle" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "puzzle" ADD "rating" smallint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "puzzle" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "puzzle" ADD "rating" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "puzzle" DROP CONSTRAINT "UQ_ea562d6373d1a208cbd97210f7a"`);
        await queryRunner.query(`ALTER TABLE "puzzle" DROP COLUMN "lichess_id"`);
    }

}
