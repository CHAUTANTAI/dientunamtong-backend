import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBannerTable1740556800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'banners',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'media_id',
            type: 'uuid',
          },
          {
            name: 'link_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    // Foreign key to media table
    await queryRunner.createForeignKey(
      'banners',
      new TableForeignKey({
        columnNames: ['media_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'media',
        onDelete: 'CASCADE',
      })
    );

    // Index for sort_order and is_active
    await queryRunner.query(`
      CREATE INDEX idx_banners_sort_order ON banners(sort_order);
      CREATE INDEX idx_banners_is_active ON banners(is_active);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('banners');
  }
}
