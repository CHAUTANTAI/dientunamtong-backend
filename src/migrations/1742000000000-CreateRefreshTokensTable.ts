import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateRefreshTokensTable1742000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "refresh_tokens",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "token_hash",
            type: "char",
            length: "64",
            isNullable: false,
          },
          {
            name: "device_info",
            type: "text",
            isNullable: true,
          },
          {
            name: "ip",
            type: "varchar",
            length: "45",
            isNullable: true,
          },
          {
            name: "user_agent",
            type: "text",
            isNullable: true,
          },
          {
            name: "expires_at",
            type: "timestamptz",
            isNullable: false,
          },
          {
            name: "revoked",
            type: "boolean",
            default: false,
          },
          {
            name: "replaced_by",
            type: "uuid",
            isNullable: true,
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

    await queryRunner.createIndex(
      "refresh_tokens",
      new TableIndex({
        name: "IDX_refresh_tokens_user_id",
        columnNames: ["user_id"],
      })
    );

    await queryRunner.createIndex(
      "refresh_tokens",
      new TableIndex({
        name: "IDX_refresh_tokens_token_hash",
        columnNames: ["token_hash"],
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("refresh_tokens");
  }
}
