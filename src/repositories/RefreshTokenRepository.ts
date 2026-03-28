import { BaseRepository } from "./BaseRepository";
import { RefreshToken } from "@entities/RefreshToken";

export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor() {
    super(RefreshToken);
  }

  async findByHash(hash: string): Promise<RefreshToken | null> {
    return await this.repository.findOne({ where: { token_hash: hash }, relations: ["user"] });
  }

  async revokeById(id: string): Promise<void> {
    await this.repository.update(id, { revoked: true } as any);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repository.createQueryBuilder().update().set({ revoked: true }).where("user_id = :userId", { userId }).execute();
  }
}
