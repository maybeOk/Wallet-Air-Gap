import express from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }

    // 提取token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wallet_airgap_secret_key_2026') as any;
    
    // 将用户信息添加到请求对象
    // @ts-ignore
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token has expired' });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// 生成JWT token
export const generateToken = (userId: string) => {
  const secretKey = process.env.JWT_SECRET || 'wallet_airgap_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  // 使用简单的方式调用jwt.sign，避免类型错误
  return jwt.sign({ userId }, secretKey, { expiresIn: expiresIn as any });
};