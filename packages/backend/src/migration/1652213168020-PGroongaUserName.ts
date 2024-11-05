import { MigrationInterface, QueryRunner } from "typeorm";

export class PGroongaUserName1652213168020 implements MigrationInterface {
    name = 'PGroongaUserName1652213168020'

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_065d4d8f3b5adb4a08841eae3c" ON "user" USING "pgroonga" ("name" pgroonga_varchar_full_text_search_ops_v2)`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_065d4d8f3b5adb4a08841eae3c"`);
    }
}