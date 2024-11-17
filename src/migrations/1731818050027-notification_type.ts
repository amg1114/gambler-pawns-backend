import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationType1731818050027 implements MigrationInterface {
    name = 'NotificationType1731818050027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_3449b54a03381da49713e1b76a2"`);
        await queryRunner.query(`ALTER TABLE "notification" RENAME COLUMN "notification_type_notification_type_id" TO "type"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('Wants to play with you', 'Accepted to play with you', 'Wants to join club', 'Made a post', 'Request to be your friend', 'Accepted your friend request', 'You are admin of a club now', 'System Notification')`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "type" "public"."notification_type_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "type" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" RENAME COLUMN "type" TO "notification_type_notification_type_id"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_3449b54a03381da49713e1b76a2" FOREIGN KEY ("notification_type_notification_type_id") REFERENCES "notification_type"("notification_type_id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
