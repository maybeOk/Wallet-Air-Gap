import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <h1>钱包空气隔离解决方案</h1>
      <p>
        保护您的数字资产安全，通过硬件钱包和智能合约技术，
        实现真正的"空气隔离"安全模型，确保即使在OpenClaw代理被攻击的情况下，
        您的数字资产也能得到保护。
      </p>
      
      <div className="features">
        <div className="feature-card">
          <h3>硬件钱包集成</h3>
          <p>支持Ledger和Trezor等硬件钱包，提供物理签名保护，确保私钥永不暴露。</p>
        </div>
        
        <div className="feature-card">
          <h3>智能合约安全</h3>
          <p>基于Sui区块链的智能合约，实现交易验证和多签名机制，增强交易安全性。</p>
        </div>
        
        <div className="feature-card">
          <h3>实时风险评估</h3>
          <p>智能分析交易风险，识别异常交易模式，提供实时安全建议。</p>
        </div>
        
        <div className="feature-card">
          <h3>交易管理</h3>
          <p>完整的交易提议、审批和执行流程，确保每笔交易都经过严格验证。</p>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '40px' }}>
        <h2>如何使用</h2>
        <ol style={{ lineHeight: '1.6' }}>
          <li>连接您的硬件钱包（Ledger或Trezor）</li>
          <li>创建交易提议，填写金额和接收地址</li>
          <li>系统自动评估交易风险</li>
          <li>在硬件钱包上确认交易签名</li>
          <li>交易提交到Sui区块链</li>
          <li>实时跟踪交易状态</li>
        </ol>
      </div>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>安全优势</h2>
        <ul style={{ lineHeight: '1.6' }}>
          <li>私钥永不存储在本地，完全空气隔离</li>
          <li>多重签名机制，增强安全性</li>
          <li>智能合约级别的交易验证</li>
          <li>实时异常检测和风险评估</li>
          <li>详细的安全日志和审计记录</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;