module wallet_security::multi_signature {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::vec_set::{Self, VecSet};
    use sui::coin::{Self, Coin};
    use sui::time::{Self, Timestamp};
    
    /// 多签名钱包结构体
    struct MultiSigWallet has key {
        id: UID,
        owners: VecSet<address>,
        required_signatures: u8,
        pending_transactions: VecSet<ID>,
        created_at: u64,
        updated_at: u64,
    }
    
    /// 交易签名结构体
    struct TransactionSignature has key {
        id: UID,
        wallet_id: ID,
        transaction_id: ID,
        signer: address,
        created_at: u64,
    }
    
    /// 签名事件结构体
    struct SignatureEvent has copy, drop {
        wallet_id: ID,
        transaction_id: ID,
        signer: address,
        timestamp: u64,
    }
    
    /// 错误码
    const E_NOT_OWNER: u64 = 401;
    const E_INSUFFICIENT_SIGNATURES: u64 = 403;
    const E_INVALID_REQUIRED_SIGNATURES: u64 = 400;
    
    /// 创建多签名钱包
    public fun create_wallet(
        owners: VecSet<address>,
        required_signatures: u8,
        ctx: &mut TxContext
    ): MultiSigWallet {
        // 确保至少有一个所有者
        assert!(vec_set::length(&owners) > 0, E_INVALID_REQUIRED_SIGNATURES);
        // 确保所需签名数不超过所有者数量
        assert!(required_signatures <= vec_set::length(&owners) as u8, E_INVALID_REQUIRED_SIGNATURES);
        // 确保至少需要一个签名
        assert!(required_signatures > 0, E_INVALID_REQUIRED_SIGNATURES);
        
        let wallet = MultiSigWallet {
            id: object::new(ctx),
            owners,
            required_signatures,
            pending_transactions: vec_set::empty(),
            created_at: time::now(ctx),
            updated_at: time::now(ctx),
        };
        
        wallet
    }
    
    /// 添加交易到待处理列表
    public fun add_pending_transaction(
        wallet: &mut MultiSigWallet,
        transaction_id: ID,
        ctx: &mut TxContext
    ) {
        // 只有钱包所有者可以添加交易
        assert!(vec_set::contains(&wallet.owners, &tx_context::sender(ctx)), E_NOT_OWNER);
        
        vec_set::insert(&mut wallet.pending_transactions, transaction_id);
        wallet.updated_at = time::now(ctx);
    }
    
    /// 为交易添加签名
    public fun add_signature(
        wallet: &mut MultiSigWallet,
        transaction_id: ID,
        ctx: &mut TxContext
    ): TransactionSignature {
        // 只有钱包所有者可以签名
        assert!(vec_set::contains(&wallet.owners, &tx_context::sender(ctx)), E_NOT_OWNER);
        // 交易必须在待处理列表中
        assert!(vec_set::contains(&wallet.pending_transactions, &transaction_id), E_NOT_OWNER);
        
        let signature = TransactionSignature {
            id: object::new(ctx),
            wallet_id: object::id(wallet),
            transaction_id,
            signer: tx_context::sender(ctx),
            created_at: time::now(ctx),
        };
        
        event::emit(SignatureEvent {
            wallet_id: object::id(wallet),
            transaction_id,
            signer: tx_context::sender(ctx),
            timestamp: time::now(ctx),
        });
        
        signature
    }
    
    /// 检查交易是否获得足够的签名
    public fun is_approved(
        wallet: &MultiSigWallet,
        signature_count: u8
    ): bool {
        signature_count >= wallet.required_signatures
    }
    
    /// 执行多签名交易
    public fun execute_transaction(
        wallet: &mut MultiSigWallet,
        transaction_id: ID,
        signature_count: u8,
        coins: Coin<SUI>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // 只有钱包所有者可以执行交易
        assert!(vec_set::contains(&wallet.owners, &tx_context::sender(ctx)), E_NOT_OWNER);
        // 交易必须在待处理列表中
        assert!(vec_set::contains(&wallet.pending_transactions, &transaction_id), E_NOT_OWNER);
        // 必须获得足够的签名
        assert!(is_approved(wallet, signature_count), E_INSUFFICIENT_SIGNATURES);
        
        // 转移资金
        transfer::public_transfer(coins, recipient);
        
        // 从待处理列表中移除交易
        vec_set::remove(&mut wallet.pending_transactions, &transaction_id);
        wallet.updated_at = time::now(ctx);
    }
    
    /// 获取钱包详情
    public fun get_wallet_details(
        wallet: &MultiSigWallet
    ): (
        VecSet<address>, // owners
        u8, // required_signatures
        u64, // created_at
        u64 // updated_at
    ) {
        (
            wallet.owners,
            wallet.required_signatures,
            wallet.created_at,
            wallet.updated_at
        )
    }
    
    /// 获取待处理交易
    public fun get_pending_transactions(
        wallet: &MultiSigWallet
    ): VecSet<ID> {
        wallet.pending_transactions
    }
}