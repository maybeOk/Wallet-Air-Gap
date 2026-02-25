import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import AppEth from '@ledgerhq/hw-app-eth';
import TrezorConnect from '@trezor/connect';

// 硬件钱包类型
type WalletType = 'ledger' | 'trezor';

// 钱包连接状态
interface WalletStatus {
  connected: boolean;
  type: WalletType | null;
  address: string | null;
  deviceId: string | null;
}

// 签名请求
interface SignRequest {
  transaction: string;
  path: string;
}

// 签名响应
interface SignResponse {
  signature: string;
  publicKey: string;
}

class HardwareWalletService {
  private wallets: Map<string, WalletStatus> = new Map();
  private currentWallet: string | null = null;

  // 初始化硬件钱包连接
  async initialize(): Promise<void> {
    // 初始化Trezor连接
    try {
      await TrezorConnect.init({
        manifest: {
          email: 'wallet-airgap@example.com',
          appUrl: 'http://localhost:3000',
          appName: 'Wallet Air-Gap Solution'
        }
      });
    } catch (error) {
      console.warn('Failed to initialize Trezor Connect:', error);
    }
  }

  // 连接硬件钱包
  async connect(walletType: WalletType): Promise<WalletStatus> {
    try {
      if (walletType === 'ledger') {
        return await this.connectLedger();
      } else if (walletType === 'trezor') {
        return await this.connectTrezor();
      } else {
        throw new Error('Unsupported wallet type');
      }
    } catch (error) {
      console.error('Error connecting to hardware wallet:', error);
      throw error;
    }
  }

  // 连接Ledger钱包
  private async connectLedger(): Promise<WalletStatus> {
    try {
      const transport = await TransportNodeHid.create();
      const ethApp = new AppEth(transport);
      const result = await ethApp.getAddress("44'/60'/0'/0/0");
      
      const status: WalletStatus = {
        connected: true,
        type: 'ledger',
        address: result.address,
        deviceId: 'ledger' + Math.random().toString(36).substr(2, 9)
      };
      
      this.wallets.set(status.deviceId || 'ledger', status);
      this.currentWallet = status.deviceId || 'ledger';
      
      return status;
    } catch (error) {
      console.error('Error connecting to Ledger:', error);
      throw new Error('Failed to connect to Ledger wallet');
    }
  }

  // 连接Trezor钱包
  private async connectTrezor(): Promise<WalletStatus> {
    try {
      const result = await TrezorConnect.getAddress({
        path: "m/44'/60'/0'/0/0",
        showOnTrezor: false
      });
      
      if (result.success) {
        const status: WalletStatus = {
          connected: true,
          type: 'trezor',
          address: result.payload.address,
          deviceId: 'trezor' + Math.random().toString(36).substr(2, 9)
        };
        
        this.wallets.set(status.deviceId || 'trezor', status);
        this.currentWallet = status.deviceId || 'trezor';
        
        return status;
      } else {
        // 简化错误处理，避免payload.error属性错误
        throw new Error('Failed to connect to Trezor');
      }
    } catch (error) {
      console.error('Error connecting to Trezor:', error);
      throw new Error('Failed to connect to Trezor wallet');
    }
  }

  // 断开硬件钱包
  async disconnect(deviceId: string): Promise<void> {
    try {
      this.wallets.delete(deviceId);
      if (this.currentWallet === deviceId) {
        this.currentWallet = null;
      }
    } catch (error) {
      console.error('Error disconnecting hardware wallet:', error);
      throw error;
    }
  }

  // 获取钱包状态
  getWalletStatus(deviceId: string): WalletStatus | undefined {
    return this.wallets.get(deviceId);
  }

  // 获取当前连接的钱包
  getCurrentWallet(): WalletStatus | null {
    if (!this.currentWallet) {
      return null;
    }
    return this.wallets.get(this.currentWallet) || null;
  }

  // 签名交易
  async signTransaction(signRequest: SignRequest): Promise<SignResponse> {
    try {
      if (!this.currentWallet) {
        throw new Error('No wallet connected');
      }

      const wallet = this.wallets.get(this.currentWallet);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.type === 'ledger') {
        return await this.signWithLedger(signRequest);
      } else if (wallet.type === 'trezor') {
        return await this.signWithTrezor(signRequest);
      } else {
        throw new Error('Unsupported wallet type');
      }
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  // 使用Ledger签名
  private async signWithLedger(signRequest: SignRequest): Promise<SignResponse> {
    try {
      const transport = await TransportNodeHid.create();
      const ethApp = new AppEth(transport);
      const result = await ethApp.signTransaction(
        signRequest.path,
        signRequest.transaction
      );

      return {
        signature: result.r + result.s + result.v,
        publicKey: '0x' + Math.random().toString(16).substr(2, 64) // 模拟公钥
      };
    } catch (error) {
      console.error('Error signing with Ledger:', error);
      throw new Error('Failed to sign transaction with Ledger');
    }
  }

  // 使用Trezor签名
  private async signWithTrezor(_signRequest: SignRequest): Promise<SignResponse> {
    try {
      // 模拟签名响应，实际实现需要根据Trezor API调整
      return {
        signature: '0x' + Math.random().toString(16).substr(2, 64),
        publicKey: '0x' + Math.random().toString(16).substr(2, 64)
      };
    } catch (error) {
      console.error('Error signing with Trezor:', error);
      throw new Error('Failed to sign transaction with Trezor');
    }
  }

  // 测试钱包连接
  async testConnection(deviceId: string): Promise<boolean> {
    try {
      const wallet = this.wallets.get(deviceId);
      if (!wallet) {
        return false;
      }

      // 尝试获取地址来测试连接
      if (wallet.type === 'ledger') {
        const transport = await TransportNodeHid.create();
        const ethApp = new AppEth(transport);
        await ethApp.getAddress("44'/60'/0'/0/0");
      } else if (wallet.type === 'trezor') {
        const result = await TrezorConnect.getAddress({
          path: "m/44'/60'/0'/0/0",
          showOnTrezor: false
        });
        if (!result.success) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error testing wallet connection:', error);
      return false;
    }
  }
}

export default new HardwareWalletService();