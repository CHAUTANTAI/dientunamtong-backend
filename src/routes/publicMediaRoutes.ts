import { Router } from "express";
import { AppDataSource } from "../config/database";
import { Media } from "../entities/Media";

const router = Router();

// GET /public/media - Get public media (optionally filtered by IDs)
router.get("/", async (req, res) => {
  try {
    const { ids } = req.query;
    const mediaRepository = AppDataSource.getRepository(Media);

    let query = mediaRepository.createQueryBuilder("media")
      .where("media.is_active = :isActive", { isActive: true });

    // Filter by IDs if provided
    if (ids && typeof ids === 'string') {
      const idArray = ids.split(',').filter(Boolean);
      if (idArray.length > 0) {
        query = query.andWhere("media.id IN (:...ids)", { ids: idArray });
      }
    }

    const mediaList = await query.getMany();
    res.json(mediaList);
  } catch (error) {
    console.error("Get public media error:", error);
    res.status(500).json({ message: "Failed to fetch media" });
  }
});

export default router;
