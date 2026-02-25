import express from 'express';
import securityController from '../controllers/security';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 获取安全配置
router.get('/config', authenticate, securityController.getSecurityConfig);

// 更新安全配置
router.put('/config', authenticate, securityController.updateSecurityConfig);

// 风险评估
router.post('/risk-assessment', authenticate, securityController.assessRisk);

// 获取安全日志
router.get('/logs', authenticate, securityController.getSecurityLogs);

// 触发安全扫描
router.post('/scan', authenticate, securityController.runSecurityScan);

// 获取安全建议
router.get('/recommendations', authenticate, securityController.getSecurityRecommendations);

export default router;