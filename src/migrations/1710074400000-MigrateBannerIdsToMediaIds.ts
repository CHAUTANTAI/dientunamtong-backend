import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateBannerIdsToMediaIds1710074400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all page_sections with section_identifier = 'banner'
    const bannerSections = await queryRunner.query(
      `SELECT id, content FROM page_sections WHERE section_identifier = 'banner'`
    );

    for (const section of bannerSections) {
      const content = section.content;
      
      // Rename banner_ids to media_ids
      if (content.banner_ids !== undefined) {
        content.media_ids = content.banner_ids || [];
        delete content.banner_ids;
        
        await queryRunner.query(
          `UPDATE page_sections SET content = $1 WHERE id = $2`,
          [JSON.stringify(content), section.id]
        );
        
        console.log(`✅ Migrated banner section ${section.id}: banner_ids → media_ids`);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: media_ids → banner_ids
    const bannerSections = await queryRunner.query(
      `SELECT id, content FROM page_sections WHERE section_identifier = 'banner'`
    );

    for (const section of bannerSections) {
      const content = section.content;
      
      if (content.media_ids !== undefined) {
        content.banner_ids = content.media_ids || [];
        delete content.media_ids;
        
        await queryRunner.query(
          `UPDATE page_sections SET content = $1 WHERE id = $2`,
          [JSON.stringify(content), section.id]
        );
      }
    }
  }
}
