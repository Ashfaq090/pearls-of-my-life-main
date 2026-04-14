import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSubscriptionPlanVideoAudioFields1735689600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add video recording fields
    await queryRunner.addColumn(
      'subscription_plans',
      new TableColumn({
        name: 'video_recording_allowed',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'subscription_plans',
      new TableColumn({
        name: 'max_video_length_in_seconds',
        type: 'int',
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'subscription_plans',
      new TableColumn({
        name: 'max_video_uploads',
        type: 'int',
        default: 0,
      }),
    );

    // Add audio recording fields
    await queryRunner.addColumn(
      'subscription_plans',
      new TableColumn({
        name: 'audio_recording_allowed',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'subscription_plans',
      new TableColumn({
        name: 'max_audio_length_in_seconds',
        type: 'int',
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'subscription_plans',
      new TableColumn({
        name: 'max_audio_uploads',
        type: 'int',
        default: 0,
      }),
    );

    // Add max_notes field
    await queryRunner.addColumn(
      'subscription_plans',
      new TableColumn({
        name: 'max_notes',
        type: 'int',
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'subscription_plans',
      'video_recording_allowed',
    );
    await queryRunner.dropColumn(
      'subscription_plans',
      'max_video_length_in_seconds',
    );
    await queryRunner.dropColumn('subscription_plans', 'max_video_uploads');
    await queryRunner.dropColumn(
      'subscription_plans',
      'audio_recording_allowed',
    );
    await queryRunner.dropColumn(
      'subscription_plans',
      'max_audio_length_in_seconds',
    );
    await queryRunner.dropColumn('subscription_plans', 'max_audio_uploads');
    await queryRunner.dropColumn('subscription_plans', 'max_notes');
  }
}
