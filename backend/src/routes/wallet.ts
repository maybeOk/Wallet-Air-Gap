import express from 'express';
import walletController from '../controllers/wallet';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 连接硬件钱包
router.post('/connect', authenticate, walletController.connectWallet);

// 断开硬件钱包
router.post('/disconnect', authenticate, walletController.disconnectWallet);

// 获取钱包状态
router.get('/status', authenticate, walletController.getWalletStatus);

// 获取钱包余额
router.get('/balance', authenticate, walletController.getWalletBalance);

// 获取钱包地址
router.get('/address', authenticate, walletController.getWalletAddress);

// 测试钱包连接
router.post('/test', authenticate, walletController.testWalletConnection);

export default router;