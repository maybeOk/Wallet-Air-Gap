import express from 'express';
import securityService from '../services/security';

class SecurityController {
  // 获取安全配置
  async getSecurityConfig(_req: express.Request, res: express.Response) {
    try {
      const config = securityService.getConfig();
      res.status(200).json(config);
    } catch (error) {
      console.error('Error getting security config:', error);
      res.status(500).json({ error: 'Failed to get security config' });
    }
  }

  // 更新安全配置
  async updateSecurityConfig(req: express.Request, res: express.Response) {
    try {
      const newConfig = req.body;
      const updatedConfig = securityService.updateConfig(newConfig);
      res.status(200).json(updatedConfig);
    } catch (error) {
      console.error('Error updating security config:', error);
      res.status(500).json({ error: 'Failed to update security config' });
    }
  }

  // 风险评估
  async assessRisk(req: express.Request, res: express.Response) {
    try {
      const transaction = req.body;
      
      if (!transaction.amount || !transaction.recipient) {
        return res.status(400).json({ error: 'Amount and recipient are required' });
      }

      const riskAssessment = securityService.assessRisk(transaction);
      res.status(200).json(riskAssessment);
    } catch (error) {
      console.error('Error assessing risk:', error);
      res.status(500).json({ error: 'Failed to assess risk' });
    }
  }

  // 获取安全日志
  async getSecurityLogs(req: express.Request, res: express.Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = securityService.getLogs(limit);
      res.status(200).json(logs);
    } catch (error) {
      console.error('Error getting security logs:', error);
      res.status(500).json({ error: 'Failed to get security logs' });
    }
  }

  // 触发安全扫描
  async runSecurityScan(_req: express.Request, res: express.Response) {
    try {
      const scanResult = securityService.runSecurityScan();
      res.status(200).json(scanResult);
    } catch (error) {
      console.error('Error running security scan:', error);
      res.status(500).json({ error: 'Failed to run security scan' });
    }
  }

  // 获取安全建议
  async getSecurityRecommendations(_req: express.Request, res: express.Response) {
    try {
      const recommendations = securityService.getRecommendations();
      res.status(200).json({ recommendations });
    } catch (error) {
      console.error('Error getting security recommendations:', error);
      res.status(500).json({ error: 'Failed to get security recommendations' });
    }
  }

  // 验证硬件钱包签名
  async verifySignature(req: express.Request, res: express.Response) {
    try {
      const { signature, publicKey, message } = req.body;
      
      if (!signature || !publicKey || !message) {
        return res.status(400).json({ error: 'Signature, publicKey, and message are required' });
      }

      const isValid = securityService.verifyHardwareWalletSignature(signature, publicKey, message);
      res.status(200).json({ isValid });
    } catch (error) {
      console.error('Error verifying signature:', error);
      res.status(500).json({ error: 'Failed to verify signature' });
    }
  }

  // 生成安全令牌
  async generateSecurityToken(req: express.Request, res: express.Response) {
    try {
      const token = securityService.generateSecurityToken();
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error generating security token:', error);
      res.status(500).json({ error: 'Failed to generate security token' });
    }
  }

  // 验证安全令牌
  async verifySecurityToken(req: express.Request, res: express.Response) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      const isValid = securityService.verifySecurityToken(token);
      res.status(200).json({ isValid });
    } catch (error) {
      console.error('Error verifying security token:', error);
      res.status(500).json({ error: 'Failed to verify security token' });
    }
  }
}

export default new SecurityController();