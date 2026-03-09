import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreatePageSectionsTable1740650100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "page_sections",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "page_identifier",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "section_identifier",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "content",
            type: "jsonb",
            isNullable: false,
          },
          {
            name: "sort_order",
            type: "int",
            default: 0,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Create unique index on (page_identifier, section_identifier)
    await queryRunner.createIndex(
      "page_sections",
      new TableIndex({
        name: "IDX_page_section_unique",
        columnNames: ["page_identifier", "section_identifier"],
        isUnique: true,
      })
    );

    // Create index for faster queries on page_identifier
    await queryRunner.createIndex(
      "page_sections",
      new TableIndex({
        name: "IDX_page_identifier",
        columnNames: ["page_identifier"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("page_sections");
  }
}
