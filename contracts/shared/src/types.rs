#![no_std]
//! # Type Definitions for MusicStreamX Contracts
//!
//! This module defines all the data types used across MusicStreamX smart contracts.

use soroban_sdk::{contracttype, Address, Bytes, String, Vec, Env};

/// Music track structure
#[contracttype]
#[derive(Clone)]
pub struct MusicTrack {
    pub id: Bytes,
    pub title: String,
    pub artist: Address,
    pub duration: u64,
    pub ipfs_hash: Bytes,
    pub genre: String,
    pub release_date: u64,
    pub total_streams: u64,
    pub royalty_rate: u32,
    pub active: bool,
    pub metadata: Bytes,
}

/// Music NFT structure
#[contracttype]
#[derive(Clone)]
pub struct MusicNFT {
    pub id: Bytes,
    pub track_id: Bytes,
    pub creator: Address,
    pub owner: Address,
    pub nft_type: NFTType,
    pub edition: u32,
    pub total_editions: u32,
    pub royalty_percentage: u32,
    pub artwork_hash: Bytes,
    pub created_at: u64,
    pub transferable: bool,
    pub metadata: Bytes,
}

/// NFT type enumeration
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub enum NFTType {
    Standard,
    Limited,
    Exclusive,
    Collaborative,
    Live,
    Remix,
}

/// Streaming session structure
#[contracttype]
#[derive(Clone)]
pub struct StreamingSession {
    pub id: Bytes,
    pub listener: Address,
    pub track_id: Bytes,
    pub start_time: u64,
    pub end_time: u64,
    /// Quality code: 0=standard, 1=high, 2=lossless, 3=master
    pub quality: u32,
    pub duration: u64,
    pub royalty_paid: u64,
    pub platform_fee_paid: u64,
    pub metadata: Bytes,
}

/// Fan token structure
#[contracttype]
#[derive(Clone)]
pub struct FanToken {
    pub id: Bytes,
    pub artist: Address,
    pub name: String,
    pub symbol: String,
    pub total_supply: u128,
    pub circulating_supply: u128,
    pub price: u128,
    pub created_at: u64,
    pub active: bool,
    pub metadata: Bytes,
}

/// Fan token balance structure
#[contracttype]
#[derive(Clone)]
pub struct FanTokenBalance {
    pub holder: Address,
    pub token_id: Bytes,
    pub balance: u128,
    pub engagement_score: u32,
    pub last_activity: u64,
    pub voting_power: u128,
}

/// Collaboration structure — collaborators stored as parallel Vecs
#[contracttype]
#[derive(Clone)]
pub struct Collaboration {
    pub id: Bytes,
    pub track_id: Bytes,
    /// Parallel arrays: collaborator_addresses[i] owns collaborator_splits[i] basis points
    pub collaborator_addresses: Vec<Address>,
    pub collaborator_splits: Vec<u32>,
    pub created_at: u64,
    pub active: bool,
    pub metadata: Bytes,
}

/// Live event structure
#[contracttype]
#[derive(Clone)]
pub struct LiveEvent {
    pub id: Bytes,
    pub organizer: Address,
    pub title: String,
    pub description: String,
    pub start_time: u64,
    pub end_time: u64,
    pub streaming_url: String,
    pub token_requirement: u128,
    pub max_attendees: u32,
    pub current_attendees: u32,
    pub ticket_price: u128,
    pub active: bool,
    pub metadata: Bytes,
}

/// Event attendance structure
/// `left_at` of 0 means the attendee has not yet left.
#[contracttype]
#[derive(Clone)]
pub struct EventAttendance {
    pub id: Bytes,
    pub event_id: Bytes,
    pub attendee: Address,
    pub joined_at: u64,
    /// 0 = still attending
    pub left_at: u64,
    pub duration: u64,
    pub tokens_earned: u128,
    pub active: bool,
}

/// Governance proposal structure
/// `executed_at` of 0 means not yet executed.
#[contracttype]
#[derive(Clone)]
pub struct GovernanceProposal {
    pub id: Bytes,
    pub proposer: Address,
    pub proposal_type: ProposalType,
    pub title: String,
    pub description: String,
    pub target_contract: Address,
    pub target_function: String,
    pub call_data: Bytes,
    pub voting_start: u64,
    pub voting_end: u64,
    pub votes_for: u32,
    pub votes_against: u32,
    pub votes_abstain: u32,
    pub status: ProposalStatus,
    /// 0 = not yet executed
    pub executed_at: u64,
    pub result: ProposalResultStatus,
}

/// Proposal type enumeration
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub enum ProposalType {
    ParameterChange,
    FeeAdjustment,
    FeatureUpgrade,
    EmergencyAction,
    TreasuryManagement,
    ContractUpgrade,
}

/// Proposal status enumeration
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub enum ProposalStatus {
    Active,
    Passed,
    Failed,
    Executed,
    Expired,
    Cancelled,
}

/// Proposal execution result (replaces Option<ProposalResult>)
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub enum ProposalResultStatus {
    /// Not yet executed
    Pending,
    /// Executed successfully
    Success,
    /// Execution failed
    Failure,
}

/// Vote structure
#[contracttype]
#[derive(Clone)]
pub struct Vote {
    pub voter: Address,
    pub proposal_id: Bytes,
    pub choice: VoteChoice,
    pub power: u128,
    pub timestamp: u64,
}

/// Vote choice enumeration
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub enum VoteChoice {
    For,
    Against,
    Abstain,
}

/// Artist profile structure
/// `fan_token` of empty Bytes means no fan token.
#[contracttype]
#[derive(Clone)]
pub struct ArtistProfile {
    pub address: Address,
    pub name: String,
    pub bio: String,
    pub profile_image: Bytes,
    pub social_links: Vec<String>,
    pub total_tracks: u32,
    pub total_streams: u64,
    pub total_earnings: u128,
    /// Empty Bytes = no fan token
    pub fan_token: Bytes,
    pub reputation: u32,
    pub verified: bool,
    pub created_at: u64,
    pub updated_at: u64,
}

/// Fan profile structure
#[contracttype]
#[derive(Clone)]
pub struct FanProfile {
    pub address: Address,
    pub name: String,
    pub profile_image: Bytes,
    pub favorite_artists: Vec<Address>,
    pub total_streams: u64,
    pub total_spent: u128,
    pub fan_tokens: Vec<Bytes>,
    pub engagement_score: u32,
    pub reputation: u32,
    pub created_at: u64,
    pub updated_at: u64,
}

/// Platform statistics structure
#[contracttype]
#[derive(Clone)]
pub struct PlatformStats {
    pub total_tracks: u32,
    pub total_artists: u32,
    pub total_fans: u32,
    pub streams_24h: u64,
    pub streams_7d: u64,
    pub total_nfts: u32,
    pub total_live_events: u32,
    pub revenue_24h: u128,
    pub revenue_7d: u128,
    pub last_updated: u64,
}

/// Royalty distribution structure — artist_addresses[i] earns artist_royalties[i]
#[contracttype]
#[derive(Clone)]
pub struct RoyaltyDistribution {
    pub id: Bytes,
    pub track_id: Bytes,
    pub period: u64,
    pub total_streams: u64,
    pub total_revenue: u128,
    pub platform_fee: u128,
    pub artist_addresses: Vec<Address>,
    pub artist_royalties: Vec<u128>,
    pub distributed_at: u64,
    pub finalized: bool,
}

// --- Implementations ---

impl MusicTrack {
    pub fn new(
        id: Bytes,
        title: String,
        artist: Address,
        duration: u64,
        ipfs_hash: Bytes,
        genre: String,
        royalty_rate: u32,
        metadata: Bytes,
    ) -> Self {
        Self {
            id,
            title,
            artist,
            duration,
            ipfs_hash,
            genre,
            release_date: 0,
            total_streams: 0,
            royalty_rate,
            active: true,
            metadata,
        }
    }

    pub fn validate(&self) -> bool {
        !self.title.is_empty()
            && !self.ipfs_hash.is_empty()
            && !self.genre.is_empty()
            && self.duration > 0
            && self.duration <= 3600
            && self.royalty_rate > 0
            && self.royalty_rate <= 5000
    }

    pub fn increment_streams(&mut self) {
        self.total_streams += 1;
    }
}

impl MusicNFT {
    pub fn calculate_secondary_royalty(&self, sale_price: u128) -> u128 {
        (sale_price * u128::from(self.royalty_percentage)) / 10000
    }

    pub fn is_transferable(&self) -> bool {
        self.transferable && self.active
    }
}

impl StreamingSession {
    pub fn calculate_royalty(&self, track_royalty_rate: u32, platform_fee_rate: u32) -> (u64, u64) {
        let base_royalty: u64 = 5000;
        let artist_royalty = (base_royalty * u64::from(track_royalty_rate)) / 10000;
        let platform_fee = (base_royalty * u64::from(platform_fee_rate)) / 10000;
        (artist_royalty, platform_fee)
    }

    /// Returns quality multiplier based on quality code field
    pub fn get_quality_multiplier(&self) -> u32 {
        match self.quality {
            1 => 150,
            2 => 200,
            3 => 300,
            _ => 100,
        }
    }
}

impl FanToken {
    pub fn calculate_price(&self) -> u128 {
        let supply_ratio = self.circulating_supply / self.total_supply;
        let base_price: u128 = 1_000_000;
        base_price * (10000 - supply_ratio) / 10000
    }

    pub fn mint(&mut self, amount: u128) {
        self.total_supply += amount;
        self.circulating_supply += amount;
    }

    pub fn burn(&mut self, amount: u128) {
        self.total_supply -= amount;
        self.circulating_supply -= amount;
    }
}

impl Collaboration {
    pub fn validate_splits(&self) -> bool {
        let len = self.collaborator_splits.len();
        if len == 0 || len > 10 {
            return false;
        }
        let mut total: u32 = 0;
        for i in 0..len {
            total += self.collaborator_splits.get(i).unwrap();
        }
        total == 10000
    }

    pub fn get_split(&self, collaborator: &Address) -> u32 {
        let len = self.collaborator_addresses.len();
        for i in 0..len {
            if &self.collaborator_addresses.get(i).unwrap() == collaborator {
                return self.collaborator_splits.get(i).unwrap();
            }
        }
        0
    }
}

impl LiveEvent {
    pub fn is_live(&self, current_time: u64) -> bool {
        self.active && current_time >= self.start_time && current_time <= self.end_time
    }

    pub fn can_join(&self, attendee_balance: u128) -> bool {
        self.active
            && self.current_attendees < self.max_attendees
            && attendee_balance >= self.token_requirement
    }

    pub fn add_attendee(&mut self) -> bool {
        if self.current_attendees < self.max_attendees {
            self.current_attendees += 1;
            true
        } else {
            false
        }
    }
}

impl GovernanceProposal {
    /// Check if proposal is executable given the current ledger timestamp
    pub fn is_executable(&self, current_timestamp: u64) -> bool {
        matches!(self.status, ProposalStatus::Passed) && self.voting_end < current_timestamp
    }

    pub fn get_voting_progress(&self) -> u32 {
        let total_votes = self.votes_for + self.votes_against + self.votes_abstain;
        if total_votes == 0 {
            return 0;
        }
        (self.votes_for * 100) / total_votes
    }
}
