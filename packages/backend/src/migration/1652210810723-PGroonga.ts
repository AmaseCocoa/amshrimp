import { MigrationInterface, QueryRunner } from "typeorm";

export class PGroonga1652210810723 implements MigrationInterface {
    name = 'PGroonga1652210810723'
    
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_f27f5d88941e57442be75ba9c8" ON "note" USING "pgroonga" ("text")`);
    }
    
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f27f5d88941e57442be75ba9c8"`);
    }
}