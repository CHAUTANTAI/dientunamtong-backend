import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSocialMediaUrlsToProfile1740650000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("profile");
    
    const facebookUrlExists = table?.columns.find(column => column.name === "facebook_url");
    if (!facebookUrlExists) {
      await queryRunner.addColumn(
        "profile",
        new TableColumn({
          name: "facebook_url",
          type: "varchar",
          length: "500",
          isNullable: true,
        })
      );
    }

    const tiktokUrlExists = table?.columns.find(column => column.name === "tiktok_url");
    if (!tiktokUrlExists) {
      await queryRunner.addColumn(
        "profile",
        new TableColumn({
          name: "tiktok_url",
          type: "varchar",
          length: "500",
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("profile", "tiktok_url");
    await queryRunner.dropColumn("profile", "facebook_url");
  }
}
