import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 钱包类型
export type WalletType = 'ledger' | 'trezor';

// 钱包状态接口
export interface WalletStatus {
  connected: boolean;
  type: WalletType | null;
  address: string | null;
  deviceId: string | null;
}

// 钱包状态
export interface WalletState {
  status: WalletStatus;
  balance: number;
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  status: {
    connected: false,
    type: null,
    address: null,
    deviceId: null
  },
  balance: 0,
  loading: false,
  error: null
};

// 异步Thunks
export const connectWallet = createAsyncThunk(
  'wallet/connectWallet',
  async (walletType: WalletType) => {
    const response = await fetch('http://localhost:3001/api/wallets/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ walletType })
    });
    if (!response.ok) {
      throw new Error('Failed to connect wallet');
    }
    return response.json();
  }
);

export const disconnectWallet = createAsyncThunk(
  'wallet/disconnectWallet',
  async (deviceId: string) => {
    const response = await fetch('http://localhost:3001/api/wallets/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ deviceId })
    });
    if (!response.ok) {
      throw new Error('Failed to disconnect wallet');
    }
    return response.json();
  }
);

export const getWalletBalance = createAsyncThunk(
  'wallet/getWalletBalance',
  async () => {
    const response = await fetch('http://localhost:3001/api/wallets/balance', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to get wallet balance');
    }
    const data = await response.json();
    return data.balance;
  }
);

export const getWalletAddress = createAsyncThunk(
  'wallet/getWalletAddress',
  async () => {
    const response = await fetch('http://localhost:3001/api/wallets/address', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to get wallet address');
    }
    const data = await response.json();
    return data.address;
  }
);

export const testWalletConnection = createAsyncThunk(
  'wallet/testWalletConnection',
  async (deviceId: string) => {
    const response = await fetch('http://localhost:3001/api/wallets/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ deviceId })
    });
    if (!response.ok) {
      throw new Error('Failed to test wallet connection');
    }
    const data = await response.json();
    return data.connected;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetWallet: (state) => {
      state.status = {
        connected: false,
        type: null,
        address: null,
        deviceId: null
      };
      state.balance = 0;
    }
  },
  extraReducers: (builder) => {
    // connectWallet
    builder
      .addCase(connectWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to connect wallet';
      });

    // disconnectWallet
    builder
      .addCase(disconnectWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.loading = false;
        state.status = {
          connected: false,
          type: null,
          address: null,
          deviceId: null
        };
        state.balance = 0;
      })
      .addCase(disconnectWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to disconnect wallet';
      });

    // getWalletBalance
    builder
      .addCase(getWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(getWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get wallet balance';
      });

    // getWalletAddress
    builder
      .addCase(getWalletAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWalletAddress.fulfilled, (state, action) => {
        state.loading = false;
        if (state.status.connected) {
          state.status.address = action.payload;
        }
      })
      .addCase(getWalletAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get wallet address';
      });

    // testWalletConnection
    builder
      .addCase(testWalletConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testWalletConnection.fulfilled, (state, action) => {
        state.loading = false;
        state.status.connected = action.payload;
      })
      .addCase(testWalletConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to test wallet connection';
      });
  }
});

export const { clearError, resetWallet } = walletSlice.actions;
export default walletSlice.reducer;