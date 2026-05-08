#![no_std]
//! # MusicStreamX Shared Library
//!
//! This library provides shared types, errors, events, and utilities
//! used across all MusicStreamX smart contracts.

pub mod types;
pub mod errors;
pub mod events;
pub mod constants;

// Re-export commonly used items
pub use types::*;
pub use errors::*;
pub use events::*;
pub use constants::*;

use soroban_sdk::{contracttype, Address, Env, Symbol, Vec};

/// Contract state structure for shared functionality
#[contracttype]
pub struct ContractState {
    /// Contract administrator
    pub admin: Address,
    /// Contract paused status
    pub paused: bool,
    /// Configuration settings
    pub config: PlatformConfig,
}

/// Platform configuration structure
#[contracttype]
pub struct PlatformConfig {
    /// Platform fee percentage (basis points)
    pub platform_fee_percentage: u32,
    /// Minimum royalty per stream (in stroops)
    pub min_royalty_per_stream: u64,
    /// Maximum track duration (seconds)
    pub max_track_duration: u64,
    /// Platform fee collector
    pub fee_collector: Address,
    /// Emergency pause status
    pub emergency_pause: bool,
}

impl ContractState {
    /// Create new contract state
    pub fn new(admin: Address) -> Self {
        Self {
            admin: admin.clone(),
            paused: false,
            config: PlatformConfig {
                platform_fee_percentage: 500, // 5%
                min_royalty_per_stream: 1000, // 0.0001 XLM
                max_track_duration: 3600,     // 1 hour
                fee_collector: admin,
                emergency_pause: false,
            },
        }
    }
}

impl PlatformConfig {
    /// Validate configuration values
    pub fn validate(&self) -> Result<(), ContractError> {
        if self.platform_fee_percentage > 2000 {
            return Err(ContractError::InvalidConfiguration);
        }
        if self.min_royalty_per_stream == 0 {
            return Err(ContractError::InvalidConfiguration);
        }
        if self.max_track_duration == 0 || self.max_track_duration > 7200 {
            return Err(ContractError::InvalidConfiguration);
        }
        Ok(())
    }
}

/// Utility functions for contract operations
pub mod utils {
    use soroban_sdk::{Address, Bytes, Env, Symbol, Vec};

    use crate::ContractState;

    /// Calculate streaming royalty
    pub fn calculate_royalty(stream_count: u64, royalty_rate: u32, platform_fee: u32) -> u64 {
        let total_royalty = stream_count * 1000;
        let platform_cut = (total_royalty * u64::from(platform_fee)) / 10000;
        let artist_royalty = total_royalty - platform_cut;
        (artist_royalty * u64::from(royalty_rate)) / 10000
    }

    /// Calculate NFT royalty split
    pub fn calculate_nft_royalty(
        sale_price: u128,
        royalty_percentage: u32,
        platform_fee: u32,
    ) -> (u128, u128, u128) {
        let platform_cut = (sale_price * u128::from(platform_fee)) / 10000;
        let artist_royalty = (sale_price * u128::from(royalty_percentage)) / 10000;
        let remaining = sale_price - platform_cut - artist_royalty;
        (artist_royalty, platform_cut, remaining)
    }

    /// Generate unique ID using ledger timestamp and sequence
    pub fn generate_unique_id(env: &Env, prefix: &Symbol) -> Bytes {
        let timestamp = env.ledger().timestamp();
        let sequence = env.ledger().sequence();
        let mut bytes = Bytes::new(env);
        bytes.extend_from_array(&timestamp.to_be_bytes());
        bytes.extend_from_array(&sequence.to_be_bytes());
        let _ = prefix; // prefix used as logical namespace; included via storage key
        bytes
    }

    /// Check if contract is paused
    pub fn is_paused(env: &Env) -> bool {
        let key = Symbol::new(env, "STATE");
        let state: ContractState = env.storage().instance().get(&key).unwrap();
        state.paused
    }

    /// Calculate fan token rewards
    pub fn calculate_fan_rewards(
        engagement_score: u32,
        base_reward: u128,
        multiplier: u32,
    ) -> u128 {
        let engagement_multiplier = u128::from(engagement_score / 100);
        base_reward * engagement_multiplier * u128::from(multiplier) / 10000
    }

    /// Validate music metadata
    pub fn validate_music_metadata(
        title: &Bytes,
        artist: &Bytes,
        duration: u64,
        ipfs_hash: &Bytes,
    ) -> bool {
        !title.is_empty()
            && !artist.is_empty()
            && duration > 0
            && duration <= 3600
            && !ipfs_hash.is_empty()
            && ipfs_hash.len() >= 46
    }

    /// Calculate collaboration split — returns parallel vecs of addresses and amounts
    pub fn calculate_collaboration_split(
        env: &Env,
        total_revenue: u128,
        addresses: &Vec<Address>,
        percentages: &Vec<u32>,
    ) -> (Vec<Address>, Vec<u128>) {
        let mut out_addresses: Vec<Address> = Vec::new(env);
        let mut out_amounts: Vec<u128> = Vec::new(env);
        let len = addresses.len();
        for i in 0..len {
            let address = addresses.get(i).unwrap();
            let percentage = percentages.get(i).unwrap();
            let amount = (total_revenue * u128::from(percentage)) / 10000;
            out_addresses.push_back(address);
            out_amounts.push_back(amount);
        }
        (out_addresses, out_amounts)
    }

    /// Validate collaboration splits
    pub fn validate_collaboration_splits(percentages: &Vec<u32>) -> bool {
        let len = percentages.len();
        if len == 0 || len > 10 {
            return false;
        }
        let mut total: u32 = 0;
        for i in 0..len {
            total += percentages.get(i).unwrap();
        }
        total == 10000
    }

    /// Calculate streaming rewards
    pub fn calculate_streaming_rewards(
        stream_count: u64,
        quality_multiplier: u32,
        base_reward: u64,
    ) -> u64 {
        stream_count * base_reward * u64::from(quality_multiplier) / 100
    }

    /// Get music quality multiplier from a u32 quality code
    /// 0=standard(100), 1=high(150), 2=lossless(200), 3=master(300)
    pub fn get_quality_multiplier(quality: u32) -> u32 {
        match quality {
            1 => 150,
            2 => 200,
            3 => 300,
            _ => 100,
        }
    }

    /// Validate fan token balance
    pub fn validate_fan_token_balance(balance: u128, required: u128) -> bool {
        balance >= required
    }

    /// Calculate governance voting power
    pub fn calculate_voting_power(token_balance: u128, reputation_score: u32) -> u128 {
        let reputation_multiplier = u128::from(reputation_score / 100);
        token_balance * reputation_multiplier / 100
    }
}

/// Constants used across contracts
pub mod constants {
    /// Platform constants
    pub const MIN_PLATFORM_FEE: u32 = 100;
    pub const MAX_PLATFORM_FEE: u32 = 2000;
    pub const DEFAULT_PLATFORM_FEE: u32 = 500;
    pub const MIN_ROYALTY_PER_STREAM: u64 = 1000;
    pub const MAX_TRACK_DURATION: u64 = 3600;
    pub const DEFAULT_TRACK_DURATION: u64 = 300;

    /// Music NFT constants
    pub const MIN_NFT_SUPPLY: u32 = 1;
    pub const MAX_NFT_SUPPLY: u32 = 10000;
    pub const DEFAULT_NFT_ROYALTY: u32 = 1000;
    pub const MAX_NFT_ROYALTY: u32 = 5000;

    /// Streaming constants
    pub const MIN_STREAM_REWARD: u64 = 1000;
    pub const MAX_STREAM_REWARD: u64 = 100000;
    pub const DEFAULT_STREAM_REWARD: u64 = 5000;
    pub const STREAM_QUALITY_STANDARD: u32 = 100;
    pub const STREAM_QUALITY_HIGH: u32 = 150;
    pub const STREAM_QUALITY_LOSSLESS: u32 = 200;
    pub const STREAM_QUALITY_MASTER: u32 = 300;

    /// Fan token constants
    pub const MIN_FAN_TOKEN_SUPPLY: u128 = 1_000_000;
    pub const MAX_FAN_TOKEN_SUPPLY: u128 = 10_000_000_000;
    pub const DEFAULT_FAN_TOKEN_SUPPLY: u128 = 1_000_000_000;
    pub const MIN_ENGAGEMENT_SCORE: u32 = 0;
    pub const MAX_ENGAGEMENT_SCORE: u32 = 10000;

    /// Governance constants
    pub const VOTING_PERIOD: u64 = 604800;
    pub const QUORUM_REQUIREMENT: u32 = 1000;
    pub const PROPOSAL_THRESHOLD: u32 = 500;
    pub const MIN_VOTING_POWER: u128 = 1000;

    /// Amount constants (in stroops)
    pub const ONE_XLM: u128 = 10_000_000;
    pub const MIN_MINT_PRICE: u128 = 10_000_000;
    pub const MAX_MINT_PRICE: u128 = 10_000_000_000;
    pub const MIN_LISTING_PRICE: u128 = 1_000_000;
    pub const MAX_LISTING_PRICE: u128 = 1_000_000_000;

    /// Fee collector constants
    pub const PLATFORM_FEE_SHARE: u32 = 5000;
    pub const ARTIST_FEE_SHARE: u32 = 4000;
    pub const TREASURY_SHARE: u32 = 1000;

    /// IPFS constants
    pub const MIN_IPFS_HASH_LENGTH: u32 = 46;
    pub const MAX_IPFS_HASH_LENGTH: u32 = 64;
    pub const MAX_METADATA_SIZE: u32 = 4096;

    /// Collaboration constants
    pub const MIN_COLLABORATORS: u32 = 1;
    pub const MAX_COLLABORATORS: u32 = 10;
    pub const MIN_COLLABORATOR_SPLIT: u32 = 500;
    pub const MAX_COLLABORATOR_SPLIT: u32 = 5000;

    /// Quality codes (u32) — use with get_quality_multiplier
    pub const QUALITY_STANDARD: u32 = 0;
    pub const QUALITY_HIGH: u32 = 1;
    pub const QUALITY_LOSSLESS: u32 = 2;
    pub const QUALITY_MASTER: u32 = 3;

    /// Storage key strings
    pub const STATE_KEY: &str = "STATE";
    pub const ADMIN_KEY: &str = "ADMIN";
    pub const CONFIG_KEY: &str = "CONFIG";
}
