import { Router } from 'express';
import { getSystemInfo } from '../controllers/public/publicSystemInfoController';

const router = Router();

router.get('/', getSystemInfo);

export default router;
