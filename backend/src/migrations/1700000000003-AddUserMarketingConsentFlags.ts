import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserMarketingConsentFlags1700000000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'email_marketing_opt_in',
        type: 'boolean',
        default: true,
      })
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'sms_consent_opt_in',
        type: 'boolean',
        default: true,
      })
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'subscription_email_sent',
        type: 'boolean',
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'subscription_email_sent');
    await queryRunner.dropColumn('users', 'sms_consent_opt_in');
    await queryRunner.dropColumn('users', 'email_marketing_opt_in');
  }
}
