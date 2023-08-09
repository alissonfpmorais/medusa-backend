import { MigrationInterface, QueryRunner } from "typeorm"

export class ExtendCustomerWithDocument1691589113412 implements MigrationInterface {
    name = `ExtendCustomerWithDocument1691589113412`;

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE customer ADD COLUMN document VARCHAR(14);`);
        await queryRunner.query(`UPDATE customer SET document = 'N/A' WHERE document IS NULL;`);
        await queryRunner.query(`ALTER TABLE customer ALTER COLUMN document SET NOT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE customer DROP COLUMN document;`);
    }
}
