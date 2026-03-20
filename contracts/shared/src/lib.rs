//! # MusicStreamX Shared Library
//! 
//! This library provides shared types, errors, events, and utilities
//! used across all MusicStreamX smart contracts.

pub mod types;
pub mod errors;
pub mod events;
pub mod utils;
pub mod constants;

// Re-export commonly used items
pub use types::*;
pub use errors::*;
pub use events::*;
pub use constants::*;

use soroban_sdk::{contracttype, Address, Bytes, Env, Symbol};

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
            admin,
            paused: false,
            config: PlatformConfig {
                platform_fee_percentage: 500, // 5%
                min_royalty_per_stream: 1000, // 0.0001 XLM
                max_track_duration: 3600, // 1 hour
                fee_collector: admin.clone(),
                emergency_pause: false,
            },
        }
    }
}

impl PlatformConfig {
    /// Validate configuration values
    pub fn validate(&self) -> Result<(), ContractError> {
        if self.platform_fee_percentage > 2000 { // 20%
            return Err(ContractError::InvalidConfiguration);
        }
        if self.min_royalty_per_stream == 0 {
            return Err(ContractError::InvalidConfiguration);
        }
        if self.max_track_duration == 0 || self.max_track_duration > 7200 { // 2 hours max
            return Err(ContractError::InvalidConfiguration);
        }
        Ok(())
    }
}

/// Utility functions for contract operations
pub mod utils {
    use super::*;
    use soroban_sdk::{Env, Address, Bytes};

    /// Calculate streaming royalty
    pub fn calculate_royalty(
        stream_count: u64,
        royalty_rate: u32,
        platform_fee: u32,
    ) -> u64 {
        let total_royalty = stream_count * 1000; // Base royalty per stream
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

    /// Validate address format
    pub fn validate_address(address: &Address) -> bool {
        !address.is_zero()
    }

    /// Generate unique ID using timestamp and random bytes
    pub fn generate_unique_id(env: &Env, prefix: &Symbol) -> Bytes {
        let timestamp = env.ledger().timestamp();
        let random_bytes = env.prng().gen::<[u8; 16]>();
        let mut id_bytes = prefix.to_bytes();
        id_bytes.extend_from_slice(&timestamp.to_be_bytes());
        id_bytes.extend_from_slice(&random_bytes);
        Bytes::from_slice(&id_bytes)
    }

    /// Check if contract is paused
    pub fn is_paused(env: &Env) -> bool {
        let state: ContractState = env.storage().instance().get(&Symbol::new(&env, "STATE")).unwrap();
        state.paused
    }

    /// Calculate fan token rewards
    pub fn calculate_fan_rewards(
        engagement_score: u32,
        base_reward: u128,
        multiplier: u32,
    ) -> u128 {
        let engagement_multiplier = engagement_score / 100; // Convert to percentage
        base_reward * u128::from(engagement_multiplier) * u128::from(multiplier) / 10000
    }

    /// Validate music metadata
    pub fn validate_music_metadata(
        title: &Bytes,
        artist: &Bytes,
        duration: u64,
        ipfs_hash: &Bytes,
    ) -> bool {
        !title.is_empty() && 
        !artist.is_empty() && 
        duration > 0 && 
        duration <= 3600 && // 1 hour max
        !ipfs_hash.is_empty() &&
        ipfs_hash.len() >= 46 // IPFS hash minimum length
    }

    /// Calculate collaboration split
    pub fn calculate_collaboration_split(
        total_revenue: u128,
        splits: &[(Address, u32)],
    ) -> Vec<(Address, u128)> {
        splits
            .iter()
            .map(|(address, percentage)| {
                let amount = (total_revenue * u128::from(*percentage)) / 10000;
                (address.clone(), amount)
            })
            .collect()
    }

    /// Validate collaboration splits
    pub fn validate_collaboration_splits(splits: &[(Address, u32)]) -> bool {
        if splits.is_empty() || splits.len() > 10 { // Max 10 collaborators
            return false;
        }
        
        let total_percentage: u32 = splits.iter().map(|(_, percentage)| *percentage).sum();
        total_percentage == 10000 // Must sum to 100%
    }

    /// Calculate streaming rewards
    pub fn calculate_streaming_rewards(
        stream_count: u64,
        quality_multiplier: u32,
        base_reward: u64,
    ) -> u64 {
        stream_count * base_reward * u64::from(quality_multiplier) / 100
    }

    /// Get music quality multiplier
    pub fn get_quality_multiplier(quality: &str) -> u32 {
        match quality {
            "standard" => 100,
            "high" => 150,
            "lossless" => 200,
            "master" => 300,
            _ => 100,
        }
    }

    /// Validate fan token balance
    pub fn validate_fan_token_balance(balance: u128, required: u128) -> bool {
        balance >= required
    }

    /// Calculate governance voting power
    pub fn calculate_voting_power(
        token_balance: u128,
        reputation_score: u32,
    ) -> u128 {
        let reputation_multiplier = reputation_score / 100; // Convert to percentage
        token_balance * u128::from(reputation_multiplier) / 100
    }
}

/// Constants used across contracts
pub mod constants {
    use soroban_sdk::Symbol;

    /// Storage keys
    pub const STATE_KEY: Symbol = Symbol::new(&"STATE");
    pub const ADMIN_KEY: Symbol = Symbol::new(&"ADMIN");
    pub const CONFIG_KEY: Symbol = Symbol::new(&"CONFIG");

    /// Platform constants
    pub const MIN_PLATFORM_FEE: u32 = 100; // 1%
    pub const MAX_PLATFORM_FEE: u32 = 2000; // 20%
    pub const DEFAULT_PLATFORM_FEE: u32 = 500; // 5%
    pub const MIN_ROYALTY_PER_STREAM: u64 = 1000; // 0.0001 XLM
    pub const MAX_TRACK_DURATION: u64 = 3600; // 1 hour
    pub const DEFAULT_TRACK_DURATION: u64 = 300; // 5 minutes

    /// Music NFT constants
    pub const MIN_NFT_SUPPLY: u32 = 1;
    pub const MAX_NFT_SUPPLY: u32 = 10000;
    pub const DEFAULT_NFT_ROYALTY: u32 = 1000; // 10%
    pub const MAX_NFT_ROYALTY: u32 = 5000; // 50%

    /// Streaming constants
    pub const MIN_STREAM_REWARD: u64 = 1000; // 0.0001 XLM per stream
    pub const MAX_STREAM_REWARD: u64 = 100000; // 0.01 XLM per stream
    pub const DEFAULT_STREAM_REWARD: u64 = 5000; // 0.0005 XLM per stream
    pub const STREAM_QUALITY_STANDARD: u32 = 100;
    pub const STREAM_QUALITY_HIGH: u32 = 150;
    pub const STREAM_QUALITY_LOSSLESS: u32 = 200;
    pub const STREAM_QUALITY_MASTER: u32 = 300;

    /// Fan token constants
    pub const MIN_FAN_TOKEN_SUPPLY: u128 = 1000000; // 1M tokens
    pub const MAX_FAN_TOKEN_SUPPLY: u128 = 10000000000; // 10B tokens
    pub const DEFAULT_FAN_TOKEN_SUPPLY: u128 = 1000000000; // 1B tokens
    pub const MIN_ENGAGEMENT_SCORE: u32 = 0;
    pub const MAX_ENGAGEMENT_SCORE: u32 = 10000;

    /// Governance constants
    pub const VOTING_PERIOD: u64 = 604800; // 7 days
    pub const QUORUM_REQUIREMENT: u32 = 1000; // 10%
    pub const PROPOSAL_THRESHOLD: u32 = 500; // 5% of total supply
    pub const MIN_VOTING_POWER: u128 = 1000; // Minimum tokens to vote

    /// Amount constants (in stroops)
    pub const ONE_XLM: u128 = 10000000; // 1 XLM
    pub const MIN_MINT_PRICE: u128 = 10000000; // 1 XLM
    pub const MAX_MINT_PRICE: u128 = 10000000000; // 1000 XLM
    pub const MIN_LISTING_PRICE: u128 = 1000000; // 0.001 XLM
    pub const MAX_LISTING_PRICE: u128 = 1000000000; // 100 XLM

    /// Fee collector constants
    pub const PLATFORM_FEE_SHARE: u32 = 5000; // 50%
    pub const ARTIST_FEE_SHARE: u32 = 4000; // 40%
    pub const TREASURY_SHARE: u32 = 1000; // 10%

    /// IPFS constants
    pub const MIN_IPFS_HASH_LENGTH: usize = 46;
    pub const MAX_IPFS_HASH_LENGTH: usize = 64;
    pub const MAX_METADATA_SIZE: usize = 4096; // 4KB

    /// Collaboration constants
    pub const MIN_COLLABORATORS: usize = 1;
    pub const MAX_COLLABORATORS: usize = 10;
    pub const MIN_COLLABORATOR_SPLIT: u32 = 500; // 5%
    pub const MAX_COLLABORATOR_SPLIT: u32 = 5000; // 50%

    /// Quality constants
    pub const QUALITY_STANDARD: &str = "standard";
    pub const QUALITY_HIGH: &str = "high";
    pub const QUALITY_LOSSLESS: &str = "lossless";
    pub const QUALITY_MASTER: &str = "master";
}
