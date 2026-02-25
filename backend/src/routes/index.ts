import express from 'express';
import transactionRoutes from './transaction';
import walletRoutes from './wallet';
import securityRoutes from './security';

const router = express.Router();

// 交易相关路由
router.use('/transactions', transactionRoutes);

// 钱包相关路由
router.use('/wallets', walletRoutes);

// 安全相关路由
router.use('/security', securityRoutes);

export default router;