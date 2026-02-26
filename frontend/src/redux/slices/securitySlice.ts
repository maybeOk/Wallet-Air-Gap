import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 安全配置接口
export interface SecurityConfig {
  securityLevel: 'low' | 'medium' | 'high';
  maxTransactionAmount: number;
  allowedAddresses: string[];
  requireHardwareWallet: boolean;
  enableRiskAssessment: boolean;
  enableAnomalyDetection: boolean;
}

// 风险评估结果
export interface RiskAssessment {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  isApproved: boolean;
}

// 安全日志
export interface SecurityLog {
  id: string;
  timestamp: string;
  eventType: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  details?: any;
}

// 安全扫描结果
export interface SecurityScanResult {
  scanId: string;
  timestamp: string;
  results: {
    vulnerabilities: string[];
    warnings: string[];
    recommendations: string[];
  };
}

// 安全状态
export interface SecurityState {
  config: SecurityConfig;
  riskAssessment: RiskAssessment | null;
  logs: SecurityLog[];
  scanResult: SecurityScanResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: SecurityState = {
  config: {
    securityLevel: 'high',
    maxTransactionAmount: 10000,
    allowedAddresses: [],
    requireHardwareWallet: true,
    enableRiskAssessment: true,
    enableAnomalyDetection: true
  },
  riskAssessment: null,
  logs: [],
  scanResult: null,
  loading: false,
  error: null
};

// 异步Thunks
export const getSecurityConfig = createAsyncThunk(
  'security/getSecurityConfig',
  async () => {
    const response = await fetch('http://localhost:3001/api/security/config', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to get security config');
    }
    return response.json();
  }
);

export const updateSecurityConfig = createAsyncThunk(
  'security/updateSecurityConfig',
  async (config: Partial<SecurityConfig>) => {
    const response = await fetch('http://localhost:3001/api/security/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(config)
    });
    if (!response.ok) {
      throw new Error('Failed to update security config');
    }
    return response.json();
  }
);

export const assessRisk = createAsyncThunk(
  'security/assessRisk',
  async (transaction: {
    amount: number;
    recipient: string;
    proposer: string;
  }) => {
    const response = await fetch('http://localhost:3001/api/security/risk-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(transaction)
    });
    if (!response.ok) {
      throw new Error('Failed to assess risk');
    }
    return response.json();
  }
);

export const getSecurityLogs = createAsyncThunk(
  'security/getSecurityLogs',
  async (limit?: number) => {
    const url = limit ? `http://localhost:3001/api/security/logs?limit=${limit}` : 'http://localhost:3001/api/security/logs';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to get security logs');
    }
    return response.json();
  }
);

export const runSecurityScan = createAsyncThunk(
  'security/runSecurityScan',
  async () => {
    const response = await fetch('http://localhost:3001/api/security/scan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to run security scan');
    }
    return response.json();
  }
);

export const getSecurityRecommendations = createAsyncThunk(
  'security/getSecurityRecommendations',
  async () => {
    const response = await fetch('http://localhost:3001/api/security/recommendations', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to get security recommendations');
    }
    const data = await response.json();
    return data.recommendations;
  }
);

const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRiskAssessment: (state) => {
      state.riskAssessment = null;
    },
    clearScanResult: (state) => {
      state.scanResult = null;
    }
  },
  extraReducers: (builder) => {
    // getSecurityConfig
    builder
      .addCase(getSecurityConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSecurityConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(getSecurityConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get security config';
      });

    // updateSecurityConfig
    builder
      .addCase(updateSecurityConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSecurityConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(updateSecurityConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update security config';
      });

    // assessRisk
    builder
      .addCase(assessRisk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assessRisk.fulfilled, (state, action) => {
        state.loading = false;
        state.riskAssessment = action.payload;
      })
      .addCase(assessRisk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to assess risk';
      });

    // getSecurityLogs
    builder
      .addCase(getSecurityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSecurityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(getSecurityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get security logs';
      });

    // runSecurityScan
    builder
      .addCase(runSecurityScan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runSecurityScan.fulfilled, (state, action) => {
        state.loading = false;
        state.scanResult = action.payload;
      })
      .addCase(runSecurityScan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to run security scan';
      });
  }
});

export const { clearError, clearRiskAssessment, clearScanResult } = securitySlice.actions;
export default securitySlice.reducer;