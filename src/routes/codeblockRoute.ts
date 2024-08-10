import { Router } from 'express';
import { getAll, getCodeBlock } from '../controllers/codeblockController';

const router = Router();

router.get('/', getAll);

router.get('/:codeBlockId', getCodeBlock);

export default router;
