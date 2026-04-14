import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            name: 'role',
            type: 'enum',
            enum: ['user', 'admin', 'keyholder'],
            default: "'user'",
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'hashed_password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'reset_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'reset_token_expiry',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'username',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'permanent_address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'date_of_birth',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'is_email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_phone_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_terminated',
            type: 'boolean',
            default: false,
          },
          {
            name: 'terminated_at',
            type: 'datetime',
            isNullable: true,
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
      }),
      true,
    );

    // Create Subscription Plans table
    await queryRunner.createTable(
      new Table({
        name: 'subscription_plans',
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
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'features',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'max_video_length',
            type: 'int',
            default: 0,
          },
          {
            name: 'max_images',
            type: 'int',
            default: 0,
          },
          {
            name: 'max_uploads',
            type: 'int',
            default: 0,
          },
          {
            name: 'billing_period',
            type: 'varchar',
            length: '20',
            default: "'monthly'",
          },
        ],
      }),
      true,
    );

    // Create User Subscriptions table
    await queryRunner.createTable(
      new Table({
        name: 'user_subscriptions',
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
            name: 'userId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'planId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'startDate',
            type: 'datetime',
          },
          {
            name: 'endDate',
            type: 'datetime',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'cancelled', 'expired', 'suspended'],
            default: "'active'",
          },
          {
            name: 'paypalSubscriptionId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'paypalOrderId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_on',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_on',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create Payments table
    await queryRunner.createTable(
      new Table({
        name: 'payments',
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
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '10',
            default: "'USD'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: "'pending'",
          },
          {
            name: 'paypal_order_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'paypal_subscription_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'transaction_data',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_on',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_on',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create Key Holders table
    await queryRunner.createTable(
      new Table({
        name: 'key_holders',
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
            name: 'first_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'street',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'state',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'zip',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'relation',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'image_path',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'token_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'pin',
            type: 'varchar',
            length: '10',
            isNullable: true,
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
      }),
      true,
    );

    // Create Uploaded Content table
    await queryRunner.createTable(
      new Table({
        name: 'uploaded_content',
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
            name: 'content_type',
            type: 'enum',
            enum: ['video', 'image', 'audio', 'note'],
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'url',
            type: 'varchar',
            length: '1000',
          },
          {
            name: 'source_type',
            type: 'enum',
            enum: ['upload', 'youtube', 'vimeo', 'recorded'],
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'size',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: true,
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
      }),
      true,
    );

    // Add Foreign Keys
    await queryRunner.createForeignKey(
      'user_subscriptions',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_subscriptions',
      new TableForeignKey({
        columnNames: ['planId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'subscription_plans',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'key_holders',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'uploaded_content',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add Indexes
    await queryRunner.createIndex(
      'users',
      new TableIndex({ columnNames: ['email'] }),
    );
    await queryRunner.createIndex(
      'user_subscriptions',
      new TableIndex({ columnNames: ['userId'] }),
    );
    await queryRunner.createIndex(
      'payments',
      new TableIndex({ columnNames: ['user_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('uploaded_content');
    await queryRunner.dropTable('key_holders');
    await queryRunner.dropTable('payments');
    await queryRunner.dropTable('user_subscriptions');
    await queryRunner.dropTable('subscription_plans');
    await queryRunner.dropTable('users');
  }
}
