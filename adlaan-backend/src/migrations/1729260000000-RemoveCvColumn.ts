import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveCvColumn1729260000000 implements MigrationInterface {
  name = 'RemoveCvColumn1729260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the column exists before dropping
    const table = await queryRunner.getTable('user');
    const cvColumn = table?.findColumnByName('cv');

    if (cvColumn) {
      await queryRunner.dropColumn('user', 'cv');
      console.log('✅ Dropped cv column from user table');
    } else {
      console.log('ℹ️ cv column does not exist, skipping');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore the column if migration is reverted
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'cv',
        type: 'varchar',
        isNullable: true,
      }),
    );
    console.log('✅ Restored cv column to user table');
  }
}
