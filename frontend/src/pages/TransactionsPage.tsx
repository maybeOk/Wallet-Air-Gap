import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import {
  fetchProposals,
  createProposal,
  approveProposal,
  rejectProposal,
  executeTransaction,
  ProposalStatus
} from '../redux/slices/transactionSlice';
import { getWalletBalance } from '../redux/slices/walletSlice';

// 类型定义
const useAppDispatch = () => useDispatch<AppDispatch>();

const TransactionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { proposals, loading, error } = useSelector((state: RootState) => state.transaction);
  const { status: walletStatus, balance } = useSelector((state: RootState) => state.wallet);
  
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // 加载交易提议
    dispatch(fetchProposals());
    // 加载钱包余额
    if (walletStatus.connected) {
      dispatch(getWalletBalance());
    }
  }, [dispatch, walletStatus.connected]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  }, [error]);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !recipient) {
      setErrorMessage('请填写金额和接收地址');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    try {
      await dispatch(createProposal({
        amount: parseFloat(amount),
        recipient,
        description
      })).unwrap();
      
      setSuccessMessage('交易提议创建成功');
      setAmount('');
      setRecipient('');
      setDescription('');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('创建交易提议失败');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleApproveProposal = async (proposalId: string) => {
    try {
      await dispatch(approveProposal(proposalId)).unwrap();
      setSuccessMessage('交易提议已批准');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('批准交易提议失败');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      await dispatch(rejectProposal(proposalId)).unwrap();
      setSuccessMessage('交易提议已拒绝');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('拒绝交易提议失败');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleExecuteTransaction = async (proposalId: string) => {
    if (!walletStatus.connected || !walletStatus.deviceId) {
      setErrorMessage('请先连接硬件钱包');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    try {
      await dispatch(executeTransaction({
        proposalId,
        walletId: walletStatus.deviceId
      })).unwrap();
      setSuccessMessage('交易执行成功');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage('执行交易失败');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const getStatusClassName = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.PENDING:
        return 'status-pending';
      case ProposalStatus.APPROVED:
        return 'status-approved';
      case ProposalStatus.REJECTED:
        return 'status-rejected';
      case ProposalStatus.EXECUTED:
        return 'status-executed';
      default:
        return '';
    }
  };

  const getStatusText = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.PENDING:
        return '待处理';
      case ProposalStatus.APPROVED:
        return '已批准';
      case ProposalStatus.REJECTED:
        return '已拒绝';
      case ProposalStatus.EXECUTED:
        return '已执行';
      default:
        return '未知';
    }
  };

  return (
    <div className="transactions-page">
      <h1>交易管理</h1>
      
      {walletStatus.connected && (
        <div style={{ marginBottom: '20px' }}>
          <p>当前钱包: {walletStatus.address}</p>
          <p>余额: {balance} SUI</p>
        </div>
      )}

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      <div className="transaction-form">
        <h2>创建交易提议</h2>
        <form onSubmit={handleCreateProposal}>
          <div className="form-group">
            <label className="form-label">金额 (SUI)</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入金额"
              step="0.000000001"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">接收地址</label>
            <input
              type="text"
              className="form-control"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="请输入接收地址"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">描述 (可选)</label>
            <input
              type="text"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入交易描述"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '创建中...' : '创建交易提议'}
          </button>
        </form>
      </div>

      <div className="transaction-list">
        <h2>交易提议列表</h2>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : proposals.length === 0 ? (
          <p>暂无交易提议</p>
        ) : (
          <div>
            {proposals.map((proposal) => (
              <div key={proposal.id} className="transaction-item">
                <div className="transaction-header">
                  <span className="transaction-amount">{proposal.amount} SUI</span>
                  <span className={`transaction-status ${getStatusClassName(proposal.status)}`}>
                    {getStatusText(proposal.status)}
                  </span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>接收地址:</strong> {proposal.recipient}
                </div>
                {proposal.description && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>描述:</strong> {proposal.description}
                  </div>
                )}
                <div style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>
                  <strong>创建时间:</strong> {new Date(proposal.createdAt).toLocaleString()}
                </div>
                {proposal.status === ProposalStatus.PENDING && (
                  <div style={{ marginTop: '12px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleApproveProposal(proposal.id)}
                      style={{ marginRight: '8px' }}
                    >
                      批准
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRejectProposal(proposal.id)}
                    >
                      拒绝
                    </button>
                  </div>
                )}
                {proposal.status === ProposalStatus.APPROVED && (
                  <div style={{ marginTop: '12px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleExecuteTransaction(proposal.id)}
                    >
                      执行交易
                    </button>
                  </div>
                )}
                {proposal.transactionDigest && (
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>
                    <strong>交易哈希:</strong> {proposal.transactionDigest}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;