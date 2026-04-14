import { MigrationInterface, QueryRunner, TableColumn, Table } from 'typeorm';

export class AddUrlToLegacyVideos1735689700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const table = await queryRunner.getTable('legacy_videos');

    if (!table) {
      // Create the entire table if it doesn't exist
      await queryRunner.createTable(
        new Table({
          name: 'legacy_videos',
          columns: [
            {
              name: 'id',
              type: 'varchar',
              length: '36',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: '(UUID())',
            },
            {
              name: 'user_id',
              type: 'varchar',
              length: '36',
            },
            {
              name: 'title',
              type: 'varchar',
              length: '255',
            },
            {
              name: 'description',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'url',
              type: 'varchar',
              length: '1000',
              isNullable: true,
            },
            {
              name: 'duration',
              type: 'int',
              isNullable: true,
            },
            {
              name: 'source_type',
              type: 'varchar',
              length: '255',
              default: "'upload'",
            },
            {
              name: 'created_on',
              type: 'datetime',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'created_by',
              type: 'varchar',
              length: '36',
              isNullable: true,
            },
            {
              name: 'updated_on',
              type: 'datetime',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
              isNullable: true,
            },
            {
              name: 'updated_by',
              type: 'varchar',
              length: '36',
              isNullable: true,
            },
            {
              name: 'deleted_on',
              type: 'datetime',
              isNullable: true,
            },
            {
              name: 'deleted_by',
              type: 'varchar',
              length: '36',
              isNullable: true,
            },
          ],
          foreignKeys: [
            {
              columnNames: ['user_id'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            },
          ],
        }),
        true,
      );
    } else {
      // Table exists, add missing columns
      const existingColumns = table.columns.map((col) => col.name);

      // Add url column if missing
      if (!existingColumns.includes('url')) {
        await queryRunner.addColumn(
          'legacy_videos',
          new TableColumn({
            name: 'url',
            type: 'varchar',
            length: '1000',
            isNullable: true,
          }),
        );
      }

      // Add source_type column if missing
      if (!existingColumns.includes('source_type')) {
        await queryRunner.addColumn(
          'legacy_videos',
          new TableColumn({
            name: 'source_type',
            type: 'varchar',
            length: '255',
            default: "'upload'",
          }),
        );
      }

      // Add duration column if missing
      if (!existingColumns.includes('duration')) {
        await queryRunner.addColumn(
          'legacy_videos',
          new TableColumn({
            name: 'duration',
            type: 'int',
            isNullable: true,
          }),
        );
      }

      // Add description column if missing
      if (!existingColumns.includes('description')) {
        await queryRunner.addColumn(
          'legacy_videos',
          new TableColumn({
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          }),
        );
      }

      // Add created_on column if missing
      if (!existingColumns.includes('created_on')) {
        await queryRunner.addColumn(
          'legacy_videos',
          new TableColumn({
            name: 'created_on',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          }),
        );
      }

      // Add created_by column if missing
      if (!existingColumns.includes('created_by')) {
        await queryRunner.addColumn(
          'legacy_videos',
          new TableColumn({
            name: 'created_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
          }),
        );
      }

      // Add updated_on column if missing
      if (!existingColumns.includes('updated_on')) {
        await queryRunner.addColumn(
          'legacy_videos',
          new TableColumn({
            name: 'updated_on',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: true,
          }),
        );
      }

      // Add updated_by column if missing
      if (!existingColumns.includes('updated_by')) {
        await queryRunner.addColumn(
          'legacy_videos',
          new TableColumn({
            name: 'updated_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
          }),
        );
      }

      // Add deleted_on column if missing
      if (!existingColumns.includes('deleted_on')) {
        await queryRunner.addColumn(
          'legacy_videos',
          new TableColumn({
            name: 'deleted_on',
            type: 'datetime',
            isNullable: true,
          }),
        );
      }

      // Add deleted_by column if missing
      if (!existingColumns.includes('deleted_by')) {
        await queryRunner.addColumn(
          'legacy_videos',
          new TableColumn({
            name: 'deleted_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('legacy_videos');

    if (table) {
      const existingColumns = table.columns.map((col) => col.name);

      if (existingColumns.includes('url')) {
        await queryRunner.dropColumn('legacy_videos', 'url');
      }
      if (existingColumns.includes('source_type')) {
        await queryRunner.dropColumn('legacy_videos', 'source_type');
      }
      if (existingColumns.includes('duration')) {
        await queryRunner.dropColumn('legacy_videos', 'duration');
      }
    }
  }
}
