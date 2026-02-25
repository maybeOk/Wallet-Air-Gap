import express from 'express';
import transactionController from '../controllers/transaction';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 创建交易提议
router.post('/propose', authenticate, transactionController.createProposal);

// 获取交易提议
router.get('/proposals/:id', authenticate, transactionController.getProposal);

// 获取所有交易提议
router.get('/proposals', authenticate, transactionController.getAllProposals);

// 批准交易提议
router.post('/proposals/:id/approve', authenticate, transactionController.approveProposal);

// 拒绝交易提议
router.post('/proposals/:id/reject', authenticate, transactionController.rejectProposal);

// 执行交易
router.post('/execute', authenticate, transactionController.executeTransaction);

// 获取交易状态
router.get('/status/:id', authenticate, transactionController.getTransactionStatus);

export default router;