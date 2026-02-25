import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// 交易提议状态
export enum ProposalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXECUTED = 'executed'
}

// 交易提议接口
export interface TransactionProposal {
  id: string;
  amount: number;
  recipient: string;
  description?: string;
  proposer: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  transactionDigest?: string;
}

// 交易状态
export interface TransactionState {
  proposals: TransactionProposal[];
  loading: boolean;
  error: string | null;
  currentProposal: TransactionProposal | null;
}

const initialState: TransactionState = {
  proposals: [],
  loading: false,
  error: null,
  currentProposal: null
};

// 异步Thunks
export const fetchProposals = createAsyncThunk(
  'transaction/fetchProposals',
  async () => {
    const response = await fetch('http://localhost:3001/api/transactions/proposals', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch proposals');
    }
    return response.json();
  }
);

export const createProposal = createAsyncThunk(
  'transaction/createProposal',
  async (proposalData: {
    amount: number;
    recipient: string;
    description?: string;
  }) => {
    const response = await fetch('http://localhost:3001/api/transactions/propose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(proposalData)
    });
    if (!response.ok) {
      throw new Error('Failed to create proposal');
    }
    return response.json();
  }
);

export const approveProposal = createAsyncThunk(
  'transaction/approveProposal',
  async (proposalId: string) => {
    const response = await fetch(`http://localhost:3001/api/transactions/proposals/${proposalId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to approve proposal');
    }
    return response.json();
  }
);

export const rejectProposal = createAsyncThunk(
  'transaction/rejectProposal',
  async (proposalId: string) => {
    const response = await fetch(`http://localhost:3001/api/transactions/proposals/${proposalId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to reject proposal');
    }
    return response.json();
  }
);

export const executeTransaction = createAsyncThunk(
  'transaction/executeTransaction',
  async (data: {
    proposalId: string;
    walletId: string;
  }) => {
    const response = await fetch('http://localhost:3001/api/transactions/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Failed to execute transaction');
    }
    return response.json();
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProposal: (state, action: PayloadAction<TransactionProposal | null>) => {
      state.currentProposal = action.payload;
    }
  },
  extraReducers: (builder) => {
    //  fetchProposals
    builder
      .addCase(fetchProposals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = action.payload;
      })
      .addCase(fetchProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch proposals';
      });

    // createProposal
    builder
      .addCase(createProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals.unshift(action.payload);
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create proposal';
      });

    // approveProposal
    builder
      .addCase(approveProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveProposal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.proposals.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.proposals[index] = action.payload;
        }
      })
      .addCase(approveProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to approve proposal';
      });

    // rejectProposal
    builder
      .addCase(rejectProposal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectProposal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.proposals.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.proposals[index] = action.payload;
        }
      })
      .addCase(rejectProposal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reject proposal';
      });

    // executeTransaction
    builder
      .addCase(executeTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeTransaction.fulfilled, (state, action) => {
        state.loading = false;
        // 更新交易状态
        const index = state.proposals.findIndex(p => p.id === action.payload.proposalId);
        if (index !== -1) {
          state.proposals[index].status = ProposalStatus.EXECUTED;
          state.proposals[index].transactionDigest = action.payload.transactionId;
        }
      })
      .addCase(executeTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to execute transaction';
      });
  }
});

export const { clearError, setCurrentProposal } = transactionSlice.actions;
export default transactionSlice.reducer;