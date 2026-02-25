import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { getSecurityConfig, updateSecurityConfig } from '../redux/slices/securitySlice';

// 类型定义
const useAppDispatch = () => useDispatch<AppDispatch>();

const SecurityPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { config, loading, error } = useSelector((state: RootState) => state.security);
  
  const [maxTransactionAmount, setMaxTransactionAmount] = useState<number>(10000);
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('high');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    dispatch(getSecurityConfig());
  }, [dispatch]);

  useEffect(() => {
    if (config) {
      setMaxTransactionAmount(config.maxTransactionAmount || 10000);
      setSecurityLevel(config.securityLevel || 'high');
    }
  }, [config]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  }, [error]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await dispatch(updateSecurityConfig({
        securityLevel,
        maxTransactionAmount
      })).unwrap();
      
      setSuccessMessage('安全设置更新成功');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('更新安全设置失败');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  return (
    <div className="security-page">
      <h1>安全设置</h1>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      <div className="security-settings">
        <h2>安全参数配置</h2>
        <form onSubmit={handleUpdateSettings}>
          <div className="form-group">
            <label className="form-label">安全级别</label>
            <select
              className="form-control"
              value={securityLevel}
              onChange={(e) => setSecurityLevel(e.target.value as 'low' | 'medium' | 'high')}
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
            <p style={{ fontSize: '12px', color: '#666' }}>高安全级别会对交易进行更严格的验证</p>
          </div>

          <div className="form-group">
            <label className="form-label">最大交易金额 (SUI)</label>
            <input
              type="number"
              className="form-control"
              value={maxTransactionAmount}
              onChange={(e) => setMaxTransactionAmount(parseFloat(e.target.value))}
              placeholder="请输入最大交易金额"
              step="1"
              min="0"
            />
            <p style={{ fontSize: '12px', color: '#666' }}>超过此金额的交易将需要额外的安全验证</p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '更新中...' : '更新安全设置'}
          </button>
        </form>
      </div>

      <div className="security-info" style={{ marginTop: '40px' }}>
        <h2>安全建议</h2>
        <div className="card">
          <h3>最佳安全实践</h3>
          <ul style={{ lineHeight: '1.6' }}>
            <li>定期更新硬件钱包固件</li>
            <li>使用强密码保护您的账户</li>
            <li>定期检查交易历史，确保没有未授权的交易</li>
            <li>避免在公共网络上使用钱包</li>
            <li>启用双因素认证</li>
            <li>定期备份您的钱包恢复短语</li>
          </ul>
        </div>

        <div className="card" style={{ marginTop: '20px' }}>
          <h3>风险评估系统</h3>
          <p>我们的系统会根据以下因素评估交易风险：</p>
          <ul style={{ lineHeight: '1.6' }}>
            <li>交易金额大小</li>
            <li>接收地址的信誉</li>
            <li>交易频率</li>
            <li>历史交易模式</li>
            <li>网络安全状况</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;