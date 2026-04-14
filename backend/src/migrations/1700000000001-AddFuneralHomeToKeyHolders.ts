import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFuneralHomeToKeyHolders1700000000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'key_holders',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        length: '20',
        default: "'PERSON'",
      })
    );

    await queryRunner.addColumn(
      'key_holders',
      new TableColumn({
        name: 'funeral_home_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'key_holders',
      new TableColumn({
        name: 'contact_person',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('key_holders', 'contact_person');
    await queryRunner.dropColumn('key_holders', 'funeral_home_name');
    await queryRunner.dropColumn('key_holders', 'type');
  }
}
