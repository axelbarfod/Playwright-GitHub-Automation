import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create api_test_metrics table
    await queryRunner.createTable(
      new Table({
        name: 'api_test_metrics',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'testId',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'testName',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'suiteName',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'timestamp',
            type: 'datetime',
          },
          {
            name: 'environment',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'duration',
            type: 'int',
          },
          {
            name: 'retryCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'apiCalls',
            type: 'json',
          },
          {
            name: 'totalApiTime',
            type: 'int',
          },
          {
            name: 'averageResponseTime',
            type: 'int',
          },
          {
            name: 'slowestCall',
            type: 'json',
          },
          {
            name: 'schemaValidations',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'error',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indices for api_test_metrics
    await queryRunner.createIndex(
      'api_test_metrics',
      new TableIndex({
        name: 'IDX_api_testId',
        columnNames: ['testId'],
      }),
    );

    await queryRunner.createIndex(
      'api_test_metrics',
      new TableIndex({
        name: 'IDX_api_testName_createdAt',
        columnNames: ['testName', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'api_test_metrics',
      new TableIndex({
        name: 'IDX_api_status_createdAt',
        columnNames: ['status', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'api_test_metrics',
      new TableIndex({
        name: 'IDX_api_environment',
        columnNames: ['environment'],
      }),
    );

    await queryRunner.createIndex(
      'api_test_metrics',
      new TableIndex({
        name: 'IDX_api_timestamp',
        columnNames: ['timestamp'],
      }),
    );

    // Create e2e_test_metrics table
    await queryRunner.createTable(
      new Table({
        name: 'e2e_test_metrics',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'testId',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'testName',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'suiteName',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'timestamp',
            type: 'datetime',
          },
          {
            name: 'environment',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'browser',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'duration',
            type: 'int',
          },
          {
            name: 'retryCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'pageMetrics',
            type: 'json',
          },
          {
            name: 'browserMetrics',
            type: 'json',
          },
          {
            name: 'actionMetrics',
            type: 'json',
          },
          {
            name: 'networkMetrics',
            type: 'json',
          },
          {
            name: 'visualMetrics',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'error',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indices for e2e_test_metrics
    await queryRunner.createIndex(
      'e2e_test_metrics',
      new TableIndex({
        name: 'IDX_e2e_testId',
        columnNames: ['testId'],
      }),
    );

    await queryRunner.createIndex(
      'e2e_test_metrics',
      new TableIndex({
        name: 'IDX_e2e_testName_createdAt',
        columnNames: ['testName', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'e2e_test_metrics',
      new TableIndex({
        name: 'IDX_e2e_status_createdAt',
        columnNames: ['status', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'e2e_test_metrics',
      new TableIndex({
        name: 'IDX_e2e_browser',
        columnNames: ['browser'],
      }),
    );

    await queryRunner.createIndex(
      'e2e_test_metrics',
      new TableIndex({
        name: 'IDX_e2e_environment',
        columnNames: ['environment'],
      }),
    );

    await queryRunner.createIndex(
      'e2e_test_metrics',
      new TableIndex({
        name: 'IDX_e2e_timestamp',
        columnNames: ['timestamp'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('e2e_test_metrics');
    await queryRunner.dropTable('api_test_metrics');
  }
}
