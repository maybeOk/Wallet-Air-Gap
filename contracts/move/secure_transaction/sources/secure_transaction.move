module wallet_security::secure_transaction {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::string::{Self, String};
    use sui::time::{Self, Timestamp};
    
    /// 交易提议结构体
    struct TransactionProposal has key {
        id: UID,
        amount: u64,
        recipient: address,
        proposer: address,
        status: u8, // 0: pending, 1: approved, 2: rejected, 3: executed
        description: Option<String>,
        created_at: u64,
        updated_at: u64,
    }
    
    /// 交易事件结构体
    struct TransactionEvent has copy, drop {
        proposal_id: ID,
        status: u8,
        timestamp: u64,
    }
    
    /// 错误码
    const E_NOT_AUTHORIZED: u64 = 401;
    const E_INVALID_STATUS: u64 = 403;
    const E_INSUFFICIENT_FUNDS: u64 = 402;
    
    /// 创建交易提议
    public fun create_proposal(
        amount: u64,
        recipient: address,
        description: Option<String>,
        ctx: &mut TxContext
    ): TransactionProposal {
        let proposal = TransactionProposal {
            id: object::new(ctx),
            amount,
            recipient,
            proposer: tx_context::sender(ctx),
            status: 0, // pending
            description,
            created_at: time::now(ctx),
            updated_at: time::now(ctx),
        };
        
        event::emit(TransactionEvent {
            proposal_id: object::id(&proposal),
            status: 0,
            timestamp: time::now(ctx),
        });
        
        proposal
    }
    
    /// 批准交易提议
    public fun approve_proposal(
        proposal: &mut TransactionProposal,
        ctx: &mut TxContext
    ) {
        // 只有提议者可以批准
        assert!(proposal.proposer == tx_context::sender(ctx), E_NOT_AUTHORIZED);
        // 只能批准处于pending状态的提议
        assert!(proposal.status == 0, E_INVALID_STATUS);
        
        proposal.status = 1; // approved
        proposal.updated_at = time::now(ctx);
        
        event::emit(TransactionEvent {
            proposal_id: object::id(proposal),
            status: 1,
            timestamp: time::now(ctx),
        });
    }
    
    /// 拒绝交易提议
    public fun reject_proposal(
        proposal: &mut TransactionProposal,
        ctx: &mut TxContext
    ) {
        // 只有提议者可以拒绝
        assert!(proposal.proposer == tx_context::sender(ctx), E_NOT_AUTHORIZED);
        // 只能拒绝处于pending状态的提议
        assert!(proposal.status == 0, E_INVALID_STATUS);
        
        proposal.status = 2; // rejected
        proposal.updated_at = time::now(ctx);
        
        event::emit(TransactionEvent {
            proposal_id: object::id(proposal),
            status: 2,
            timestamp: time::now(ctx),
        });
    }
    
    /// 执行交易
    public fun execute_transaction(
        proposal: &TransactionProposal,
        coins: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // 只能执行已批准的提议
        assert!(proposal.status == 1, E_INVALID_STATUS);
        // 确保金额足够
        assert!(coin::value(&coins) >= proposal.amount, E_INSUFFICIENT_FUNDS);
        
        // 转移资金
        transfer::public_transfer(coins, proposal.recipient);
        
        event::emit(TransactionEvent {
            proposal_id: object::id(proposal),
            status: 3,
            timestamp: time::now(ctx),
        });
    }
    
    /// 获取交易提议状态
    public fun get_status(proposal: &TransactionProposal): u8 {
        proposal.status
    }
    
    /// 获取交易提议详情
    public fun get_details(proposal: &TransactionProposal): (
        u64, // amount
        address, // recipient
        address, // proposer
        u8, // status
        Option<String>, // description
        u64, // created_at
        u64 // updated_at
    ) {
        (
            proposal.amount,
            proposal.recipient,
            proposal.proposer,
            proposal.status,
            proposal.description,
            proposal.created_at,
            proposal.updated_at
        )
    }
}