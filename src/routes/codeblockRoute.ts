import { Router } from 'express';
import { getAll } from '../controllers/codeblockController';

const router = Router();

router.get('/', getAll);

export default router;
