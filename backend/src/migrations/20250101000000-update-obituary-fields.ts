import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateObituaryFields1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'birth_city',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'birth_state',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'biological_mother_first',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'biological_mother_middle',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'biological_mother_last',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'biological_father_first',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'biological_father_middle',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'biological_father_last',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'stepmother_first',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'stepmother_middle',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'stepmother_last',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'stepfather_first',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'stepfather_middle',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'stepfather_last',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('obituary_info', 'birth_city');
    await queryRunner.dropColumn('obituary_info', 'birth_state');
    await queryRunner.dropColumn('obituary_info', 'biological_mother_first');
    await queryRunner.dropColumn('obituary_info', 'biological_mother_middle');
    await queryRunner.dropColumn('obituary_info', 'biological_mother_last');
    await queryRunner.dropColumn('obituary_info', 'biological_father_first');
    await queryRunner.dropColumn('obituary_info', 'biological_father_middle');
    await queryRunner.dropColumn('obituary_info', 'biological_father_last');
    await queryRunner.dropColumn('obituary_info', 'stepmother_first');
    await queryRunner.dropColumn('obituary_info', 'stepmother_middle');
    await queryRunner.dropColumn('obituary_info', 'stepmother_last');
    await queryRunner.dropColumn('obituary_info', 'stepfather_first');
    await queryRunner.dropColumn('obituary_info', 'stepfather_middle');
    await queryRunner.dropColumn('obituary_info', 'stepfather_last');
  }
}

