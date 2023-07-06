import express from 'express';

import { getContracts, createContract, deleteContract, updateContract } from '../controllers/posts.js';
import auth from '../middleware/auth.js'

const router = express.Router();

router.get('/', getContracts);
router.post('/', auth, createContract);
router.patch('/:id', auth, updateContract);
router.delete('/:id', auth, deleteContract);

export default router;