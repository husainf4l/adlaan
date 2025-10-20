import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSuperAdmin1729257620000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "user" (name, email, password, role) 
            VALUES (
                'husain',
                'al-hussein@papayatrading.com',
                '$2b$10$GSqee/qTjBmwNwf91Laatu7.QSbj.gzVSROSe91Bwhez5lzDXCWyi',
                'superadmin'
            )
            ON CONFLICT (email) 
            DO UPDATE SET 
                password = EXCLUDED.password,
                role = EXCLUDED.role,
                name = EXCLUDED.name;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "user" 
            WHERE email = 'al-hussein@papayatrading.com';
        `);
    }
}
