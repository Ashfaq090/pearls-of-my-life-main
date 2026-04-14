import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddObituaryAdvancedFields20260123000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'schools_json',
        type: 'json',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'employment_json',
        type: 'json',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'career_achievements_json',
        type: 'json',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'church_affiliation_json',
        type: 'json',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'other_achievements_json',
        type: 'json',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'club_memberships_json',
        type: 'json',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'other_group_affiliations_json',
        type: 'json',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'greatest_friendships_json',
        type: 'json',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'obituary_info',
      new TableColumn({
        name: 'special_instructions',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('obituary_info', 'schools_json');
    await queryRunner.dropColumn('obituary_info', 'employment_json');
    await queryRunner.dropColumn('obituary_info', 'career_achievements_json');
    await queryRunner.dropColumn('obituary_info', 'church_affiliation_json');
    await queryRunner.dropColumn('obituary_info', 'other_achievements_json');
    await queryRunner.dropColumn('obituary_info', 'club_memberships_json');
    await queryRunner.dropColumn('obituary_info', 'other_group_affiliations_json');
    await queryRunner.dropColumn('obituary_info', 'greatest_friendships_json');
    await queryRunner.dropColumn('obituary_info', 'special_instructions');
  }
}
