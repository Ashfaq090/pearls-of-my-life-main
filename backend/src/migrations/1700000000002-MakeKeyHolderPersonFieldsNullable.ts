import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MakeKeyHolderPersonFieldsNullable1700000000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'key_holders',
      'first_name',
      new TableColumn({
        name: 'first_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'key_holders',
      'last_name',
      new TableColumn({
        name: 'last_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'key_holders',
      'email',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'key_holders',
      'relation',
      new TableColumn({
        name: 'relation',
        type: 'varchar',
        length: '100',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'key_holders',
      'relation',
      new TableColumn({
        name: 'relation',
        type: 'varchar',
        length: '100',
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      'key_holders',
      'email',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        length: '255',
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      'key_holders',
      'last_name',
      new TableColumn({
        name: 'last_name',
        type: 'varchar',
        length: '255',
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      'key_holders',
      'first_name',
      new TableColumn({
        name: 'first_name',
        type: 'varchar',
        length: '255',
        isNullable: false,
      })
    );
  }
}
