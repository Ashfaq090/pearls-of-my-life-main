import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLegacyVideoStageLabel20260123000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'legacy_videos',
      new TableColumn({
        name: 'stage_label',
        type: 'varchar',
        length: '32',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('legacy_videos', 'stage_label');
  }
}
