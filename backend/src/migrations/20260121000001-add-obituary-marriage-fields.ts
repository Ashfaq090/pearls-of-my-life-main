import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddObituaryMarriageFields20260121000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'spouse_marriage_date',
        type: 'date',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'spouse2_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'spouse2_marriage_date',
        type: 'date',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'spouse3_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'spouse3_marriage_date',
        type: 'date',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'children2',
        type: 'json',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'children3',
        type: 'json',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('obituary_info', 'spouse_marriage_date');
    await queryRunner.dropColumn('obituary_info', 'spouse2_name');
    await queryRunner.dropColumn('obituary_info', 'spouse2_marriage_date');
    await queryRunner.dropColumn('obituary_info', 'spouse3_name');
    await queryRunner.dropColumn('obituary_info', 'spouse3_marriage_date');
    await queryRunner.dropColumn('obituary_info', 'children2');
    await queryRunner.dropColumn('obituary_info', 'children3');
  }
}
