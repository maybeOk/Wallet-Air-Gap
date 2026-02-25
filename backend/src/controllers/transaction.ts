import express from 'express';
import transactionService from '../services/transaction';

class TransactionController {
  // 创建交易提议
  async createProposal(req: express.Request, res: express.Response) {
    try {
      const { amount, recipient, description } = req.body;
      
      if (!amount || !recipient) {
        return res.status(400).json({ error: 'Amount and recipient are required' });
      }

      const proposal = await transactionService.createProposal({
        amount,
        recipient,
        description,
        proposer: 'system'
      });

      res.status(201).json(proposal);
    } catch (error) {
      console.error('Error creating transaction proposal:', error);
      res.status(500).json({ error: 'Failed to create transaction proposal' });
    }
  }

  // 获取交易提议
  async getProposal(req: express.Request, res: express.Response) {
    try {
      const { id } = req.params;
      const proposal = await transactionService.getProposal(id);
      
      if (!proposal) {
        return res.status(404).json({ error: 'Transaction proposal not found' });
      }

      res.status(200).json(proposal);
    } catch (error) {
      console.error('Error getting transaction proposal:', error);
      res.status(500).json({ error: 'Failed to get transaction proposal' });
    }
  }

  // 获取所有交易提议
  async getAllProposals(_req: express.Request, res: express.Response) {
    try {
      const proposals = await transactionService.getAllProposals();
      res.status(200).json(proposals);
    } catch (error) {
      console.error('Error getting all transaction proposals:', error);
      res.status(500).json({ error: 'Failed to get transaction proposals' });
    }
  }

  // 批准交易提议
  async approveProposal(req: express.Request, res: express.Response) {
    try {
      const { id } = req.params;
      const proposal = await transactionService.approveProposal(id);
      
      if (!proposal) {
        return res.status(404).json({ error: 'Transaction proposal not found' });
      }

      res.status(200).json(proposal);
    } catch (error) {
      console.error('Error approving transaction proposal:', error);
      res.status(500).json({ error: 'Failed to approve transaction proposal' });
    }
  }

  // 拒绝交易提议
  async rejectProposal(req: express.Request, res: express.Response) {
    try {
      const { id } = req.params;
      const proposal = await transactionService.rejectProposal(id);
      
      if (!proposal) {
        return res.status(404).json({ error: 'Transaction proposal not found' });
      }

      res.status(200).json(proposal);
    } catch (error) {
      console.error('Error rejecting transaction proposal:', error);
      res.status(500).json({ error: 'Failed to reject transaction proposal' });
    }
  }

  // 执行交易
  async executeTransaction(req: express.Request, res: express.Response) {
    try {
      const { proposalId, walletId } = req.body;
      
      if (!proposalId || !walletId) {
        return res.status(400).json({ error: 'Proposal ID and wallet ID are required' });
      }

      const transaction = await transactionService.executeTransaction(proposalId, walletId);
      res.status(200).json(transaction);
    } catch (error) {
      console.error('Error executing transaction:', error);
      res.status(500).json({ error: 'Failed to execute transaction' });
    }
  }

  // 获取交易状态
  async getTransactionStatus(req: express.Request, res: express.Response) {
    try {
      const { id } = req.params;
      const status = await transactionService.getTransactionStatus(id);
      res.status(200).json(status);
    } catch (error) {
      console.error('Error getting transaction status:', error);
      res.status(500).json({ error: 'Failed to get transaction status' });
    }
  }
}

export default new TransactionController();