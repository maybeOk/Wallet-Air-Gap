import express from 'express';
import hardwareWalletService from '../services/hardwareWallet';
import suiService from '../services/sui';

class WalletController {
  // 连接硬件钱包
  async connectWallet(req: express.Request, res: express.Response) {
    try {
      const { walletType } = req.body;
      
      if (!walletType || !['ledger', 'trezor'].includes(walletType)) {
        return res.status(400).json({ error: 'Invalid wallet type' });
      }

      const walletStatus = await hardwareWalletService.connect(walletType);
      res.status(200).json(walletStatus);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      res.status(500).json({ error: 'Failed to connect wallet' });
    }
  }

  // 断开硬件钱包
  async disconnectWallet(req: express.Request, res: express.Response) {
    try {
      const { deviceId } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
      }

      await hardwareWalletService.disconnect(deviceId);
      res.status(200).json({ message: 'Wallet disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      res.status(500).json({ error: 'Failed to disconnect wallet' });
    }
  }

  // 获取钱包状态
  async getWalletStatus(req: express.Request, res: express.Response) {
    try {
      const { deviceId } = req.query;
      
      if (!deviceId) {
        const currentWallet = hardwareWalletService.getCurrentWallet();
        return res.status(200).json(currentWallet);
      }

      const walletStatus = hardwareWalletService.getWalletStatus(deviceId as string);
      res.status(200).json(walletStatus);
    } catch (error) {
      console.error('Error getting wallet status:', error);
      res.status(500).json({ error: 'Failed to get wallet status' });
    }
  }

  // 获取钱包余额
  async getWalletBalance(_req: express.Request, res: express.Response) {
    try {
      const currentWallet = hardwareWalletService.getCurrentWallet();
      
      if (!currentWallet || !currentWallet.address) {
        return res.status(400).json({ error: 'No wallet connected' });
      }

      const balance = await suiService.getBalance(currentWallet.address);
      res.status(200).json({ balance });
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      res.status(500).json({ error: 'Failed to get wallet balance' });
    }
  }

  // 获取钱包地址
  async getWalletAddress(_req: express.Request, res: express.Response) {
    try {
      const currentWallet = hardwareWalletService.getCurrentWallet();
      
      if (!currentWallet || !currentWallet.address) {
        return res.status(400).json({ error: 'No wallet connected' });
      }

      res.status(200).json({ address: currentWallet.address });
    } catch (error) {
      console.error('Error getting wallet address:', error);
      res.status(500).json({ error: 'Failed to get wallet address' });
    }
  }

  // 测试钱包连接
  async testWalletConnection(req: express.Request, res: express.Response) {
    try {
      const { deviceId } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
      }

      const isConnected = await hardwareWalletService.testConnection(deviceId);
      res.status(200).json({ connected: isConnected });
    } catch (error) {
      console.error('Error testing wallet connection:', error);
      res.status(500).json({ error: 'Failed to test wallet connection' });
    }
  }
}

export default new WalletController();