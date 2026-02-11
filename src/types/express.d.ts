import { Profile } from "@entities/Profile";

declare global {
  namespace Express {
    interface Request {
      user?: Profile;
      userId?: string;
    }
  }
}

