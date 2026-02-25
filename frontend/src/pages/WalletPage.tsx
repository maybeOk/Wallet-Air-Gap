import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import {
  connectWallet,
  disconnectWallet,
  getWalletBalance,
  getWalletAddress,
  testWalletConnection,
  WalletType
} from '../redux/slices/walletSlice';

// 类型定义
const useAppDispatch = () => useDispatch<AppDispatch>();

const WalletPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { status: walletStatus, balance, loading, error } = useSelector((state: RootState) => state.wallet);
  
  const [walletType, setWalletType] = useState<WalletType>('ledger');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  }, [error]);

  const handleConnectWallet = async () => {
    try {
      await dispatch(connectWallet(walletType)).unwrap();
      setSuccessMessage('钱包连接成功');
      // 连接成功后获取余额和地址
      dispatch(getWalletBalance());
      dispatch(getWalletAddress());
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('连接钱包失败');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleDisconnectWallet = async () => {
    if (!walletStatus.deviceId) {
      setErrorMessage('没有连接的钱包');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    try {
      await dispatch(disconnectWallet(walletStatus.deviceId)).unwrap();
      setSuccessMessage('钱包断开成功');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('断开钱包失败');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleTestConnection = async () => {
    if (!walletStatus.deviceId) {
      setErrorMessage('没有连接的钱包');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    try {
      await dispatch(testWalletConnection(walletStatus.deviceId)).unwrap();
      setSuccessMessage('钱包连接测试成功');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('钱包连接测试失败');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleRefreshBalance = async () => {
    if (!walletStatus.connected) {
      setErrorMessage('请先连接钱包');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    try {
      await dispatch(getWalletBalance()).unwrap();
      setSuccessMessage('余额更新成功');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('更新余额失败');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  return (
    <div className="wallet-page">
      <h1>钱包管理</h1>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      <div className="wallet-connect">
        <h2>连接硬件钱包</h2>
        {!walletStatus.connected ? (
          <div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">选择钱包类型</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="radio"
                    name="walletType"
                    value="ledger"
                    checked={walletType === 'ledger'}
                    onChange={() => setWalletType('ledger')}
                  />
                  Ledger
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="radio"
                    name="walletType"
                    value="trezor"
                    checked={walletType === 'trezor'}
                    onChange={() => setWalletType('trezor')}
                  />
                  Trezor
                </label>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleConnectWallet}
              disabled={loading}
            >
              {loading ? '连接中...' : '连接钱包'}
            </button>
          </div>
        ) : (
          <div>
            <p>钱包已连接</p>
            <button
              className="btn btn-secondary"
              onClick={handleTestConnection}
              style={{ marginRight: '10px' }}
            >
              测试连接
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDisconnectWallet}
            >
              断开钱包
            </button>
          </div>
        )}
      </div>

      {walletStatus.connected && (
        <div className="wallet-status">
          <h2>钱包状态</h2>
          <div className="wallet-info">
            <div className="wallet-info-item">
              <h4>钱包类型</h4>
              <p>{walletStatus.type === 'ledger' ? 'Ledger' : 'Trezor'}</p>
            </div>
            <div className="wallet-info-item">
              <h4>钱包地址</h4>
              <p style={{ wordBreak: 'break-all' }}>{walletStatus.address}</p>
            </div>
            <div className="wallet-info-item">
              <h4>设备ID</h4>
              <p>{walletStatus.deviceId}</p>
            </div>
            <div className="wallet-info-item">
              <h4>余额</h4>
              <p>{balance} SUI</p>
              <button
                className="btn btn-secondary"
                onClick={handleRefreshBalance}
                style={{ marginTop: '8px', fontSize: '12px' }}
              >
                刷新
              </button>
            </div>
          </div>
        </div>
      )}

      {!walletStatus.connected && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>使用说明</h3>
          <ol style={{ lineHeight: '1.6' }}>
            <li>确保您的硬件钱包已连接到电脑</li>
            <li>选择您的钱包类型（Ledger或Trezor）</li>
            <li>点击"连接钱包"按钮</li>
            <li>按照硬件钱包上的提示进行操作</li>
            <li>连接成功后，您可以查看钱包余额和地址</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default WalletPage;