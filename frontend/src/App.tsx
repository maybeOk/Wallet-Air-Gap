import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TransactionsPage from './pages/TransactionsPage';
import WalletPage from './pages/WalletPage';
import SecurityPage from './pages/SecurityPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* 导航栏 */}
        <nav className="navbar">
          <div className="container">
            <div className="navbar-brand">
              钱包空气隔离解决方案
            </div>
            <ul className="navbar-nav">
              <li>
                <Link to="/">首页</Link>
              </li>
              <li>
                <Link to="/transactions">交易管理</Link>
              </li>
              <li>
                <Link to="/wallet">钱包管理</Link>
              </li>
              <li>
                <Link to="/security">安全设置</Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* 主要内容 */}
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/security" element={<SecurityPage />} />
          </Routes>
        </div>

        {/* 页脚 */}
        <footer className="footer">
          <div className="container">
            <p>&copy; 2026 钱包空气隔离解决方案 - 保护您的数字资产安全</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;