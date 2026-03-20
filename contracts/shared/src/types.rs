//! # Type Definitions for MusicStreamX Contracts
//! 
//! This module defines all the data types used across MusicStreamX smart contracts.

use soroban_sdk::{
    contracttype, Address, Bytes, Symbol, String, Vec, Map, u64, u128, i128, u32, u8, bool, Env,
};

/// Music track structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MusicTrack {
    /// Unique track identifier
    pub id: Bytes,
    /// Track title
    pub title: String,
    /// Artist address
    pub artist: Address,
    /// Track duration in seconds
    pub duration: u64,
    /// IPFS hash of audio file
    pub ipfs_hash: Bytes,
    /// Genre
    pub genre: String,
    /// Release timestamp
    pub release_date: u64,
    /// Total streams
    pub total_streams: u64,
    /// Royalty rate (basis points)
    pub royalty_rate: u32,
    /// Is active
    pub active: bool,
    /// Track metadata
    pub metadata: Bytes,
}

/// Music NFT structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct MusicNFT {
    /// Unique NFT identifier
    pub id: Bytes,
    /// Associated track
    pub track_id: Bytes,
    /// NFT creator (artist)
    pub creator: Address,
    /// Current owner
    pub owner: Address,
    /// NFT type
    pub nft_type: NFTType,
    /// Edition number
    pub edition: u32,
    /// Total editions
    pub total_editions: u32,
    /// Royalty percentage (basis points)
    pub royalty_percentage: u32,
    /// IPFS hash of artwork
    pub artwork_hash: Bytes,
    /// Creation timestamp
    pub created_at: u64,
    /// Is transferable
    pub transferable: bool,
    /// Additional metadata
    pub metadata: Bytes,
}

/// NFT type enumeration
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum NFTType {
    Standard,     // Standard music NFT
    Limited,       // Limited edition
    Exclusive,     // Exclusive release
    Collaborative, // Collaboration NFT
    Live,          // Live performance
    Remix,         // Remix version
}

/// Streaming session structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct StreamingSession {
    /// Unique session identifier
    pub id: Bytes,
    /// Listener address
    pub listener: Address,
    /// Track being streamed
    pub track_id: Bytes,
    /// Start timestamp
    pub start_time: u64,
    /// End timestamp
    pub end_time: u64,
    /// Stream quality
    pub quality: String,
    /// Stream duration (seconds)
    pub duration: u64,
    /// Royalty paid
    pub royalty_paid: u64,
    /// Platform fee paid
    pub platform_fee_paid: u64,
    /// Session metadata
    pub metadata: Bytes,
}

/// Fan token structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct FanToken {
    /// Unique token identifier
    pub id: Bytes,
    /// Artist address
    pub artist: Address,
    /// Token name
    pub name: String,
    /// Token symbol
    pub symbol: String,
    /// Total supply
    pub total_supply: u128,
    /// Current circulating supply
    pub circulating_supply: u128,
    /// Token price (in XLM)
    pub price: u128,
    /// Creation timestamp
    pub created_at: u64,
    /// Is active
    pub active: bool,
    /// Token metadata
    pub metadata: Bytes,
}

/// Fan token balance structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct FanTokenBalance {
    /// Token holder
    pub holder: Address,
    /// Token identifier
    pub token_id: Bytes,
    /// Balance
    pub balance: u128,
    /// Engagement score
    pub engagement_score: u32,
    /// Last activity timestamp
    pub last_activity: u64,
    /// Voting power
    pub voting_power: u128,
}

/// Collaboration structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct Collaboration {
    /// Unique collaboration identifier
    pub id: Bytes,
    /// Track ID
    pub track_id: Bytes,
    /// Collaborators and their splits
    pub collaborators: Vec<(Address, u32)>,
    /// Creation timestamp
    pub created_at: u64,
    /// Is active
    pub active: bool,
    /// Collaboration metadata
    pub metadata: Bytes,
}

/// Live event structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct LiveEvent {
    /// Unique event identifier
    pub id: Bytes,
    /// Event organizer
    pub organizer: Address,
    /// Event title
    pub title: String,
    /// Event description
    pub description: String,
    /// Start timestamp
    pub start_time: u64,
    /// End timestamp
    pub end_time: u64,
    /// Streaming URL
    pub streaming_url: String,
    /// Token requirement (if any)
    pub token_requirement: u128,
    /// Maximum attendees
    pub max_attendees: u32,
    /// Current attendees
    pub current_attendees: u32,
    /// Ticket price (in XLM)
    pub ticket_price: u128,
    /// Is active
    pub active: bool,
    /// Event metadata
    pub metadata: Bytes,
}

/// Event attendance structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct EventAttendance {
    /// Unique attendance identifier
    pub id: Bytes,
    /// Event ID
    pub event_id: Bytes,
    /// Attendee address
    pub attendee: Address,
    /// Join timestamp
    pub joined_at: u64,
    /// Leave timestamp
    pub left_at: Option<u64>,
    /// Duration attended (seconds)
    pub duration: u64,
    /// Tokens earned
    pub tokens_earned: u128,
    /// Is active
    pub active: bool,
}

/// Governance proposal structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct GovernanceProposal {
    /// Unique proposal identifier
    pub id: Bytes,
    /// Proposal creator
    pub proposer: Address,
    /// Proposal type
    pub proposal_type: ProposalType,
    /// Proposal title
    pub title: String,
    /// Proposal description
    pub description: String,
    /// Target contract address
    pub target_contract: Address,
    /// Target function
    pub target_function: String,
    /// Call data
    pub call_data: Bytes,
    /// Voting start timestamp
    pub voting_start: u64,
    /// Voting end timestamp
    pub voting_end: u64,
    /// Votes for
    pub votes_for: u32,
    /// Votes against
    pub votes_against: u32,
    /// Votes abstain
    pub votes_abstain: u32,
    /// Proposal status
    pub status: ProposalStatus,
    /// Execution timestamp
    pub executed_at: Option<u64>,
    /// Execution result
    pub result: Option<ProposalResult>,
}

/// Proposal type enumeration
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ProposalType {
    ParameterChange,    // Change platform parameters
    FeeAdjustment,    // Adjust platform fees
    FeatureUpgrade,   // Add new features
    EmergencyAction,   // Emergency actions
    TreasuryManagement, // Manage treasury funds
    ContractUpgrade,   // Upgrade smart contracts
}

/// Proposal status enumeration
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ProposalStatus {
    Active,       // Currently voting
    Passed,       // Voting completed successfully
    Failed,       // Voting failed
    Executed,     // Proposal executed
    Expired,      // Voting period ended
    Cancelled,    // Proposal cancelled
}

/// Proposal execution result
#[contracttype]
#[derive(Clone, Debug)]
pub struct ProposalResult {
    /// Success status
    pub success: bool,
    /// Return data
    pub data: Bytes,
    /// Error message
    pub error: Option<String>,
}

/// Vote structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct Vote {
    /// Voter address
    pub voter: Address,
    /// Proposal ID
    pub proposal_id: Bytes,
    /// Vote choice
    pub choice: VoteChoice,
    /// Voting power
    pub power: u128,
    /// Vote timestamp
    pub timestamp: u64,
}

/// Vote choice enumeration
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VoteChoice {
    For,     // Vote in favor
    Against, // Vote against
    Abstain, // Abstain from voting
}

/// Artist profile structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct ArtistProfile {
    /// Artist address
    pub address: Address,
    /// Artist name
    pub name: String,
    /// Artist bio
    pub bio: String,
    /// Profile image IPFS hash
    pub profile_image: Bytes,
    /// Social links
    pub social_links: Vec<String>,
    /// Total tracks
    pub total_tracks: u32,
    /// Total streams
    pub total_streams: u64,
    /// Total earnings
    pub total_earnings: u128,
    /// Fan token (if any)
    pub fan_token: Option<Bytes>,
    /// Reputation score
    pub reputation: u32,
    /// Verification status
    pub verified: bool,
    /// Creation timestamp
    pub created_at: u64,
    /// Last updated timestamp
    pub updated_at: u64,
}

/// Fan profile structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct FanProfile {
    /// Fan address
    pub address: Address,
    /// Fan name
    pub name: String,
    /// Profile image IPFS hash
    pub profile_image: Bytes,
    /// Favorite artists
    pub favorite_artists: Vec<Address>,
    /// Total streams
    pub total_streams: u64,
    /// Total spent
    pub total_spent: u128,
    /// Fan tokens held
    pub fan_tokens: Vec<Bytes>,
    /// Engagement score
    pub engagement_score: u32,
    /// Reputation score
    pub reputation: u32,
    /// Creation timestamp
    pub created_at: u64,
    /// Last updated timestamp
    pub updated_at: u64,
}

/// Platform statistics structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct PlatformStats {
    /// Total tracks
    pub total_tracks: u32,
    /// Total artists
    pub total_artists: u32,
    /// Total fans
    pub total_fans: u32,
    /// Total streams (24h)
    pub streams_24h: u64,
    /// Total streams (7d)
    pub streams_7d: u64,
    /// Total NFTs
    pub total_nfts: u32,
    /// Total live events
    pub total_live_events: u32,
    /// Total platform revenue (24h)
    pub revenue_24h: u128,
    /// Total platform revenue (7d)
    pub revenue_7d: u128,
    /// Last updated timestamp
    pub last_updated: u64,
}

/// Royalty distribution structure
#[contracttype]
#[derive(Clone, Debug)]
pub struct RoyaltyDistribution {
    /// Unique distribution identifier
    pub id: Bytes,
    /// Track ID
    pub track_id: Bytes,
    /// Distribution period
    pub period: u64,
    /// Total streams in period
    pub total_streams: u64,
    /// Total revenue
    pub total_revenue: u128,
    /// Platform fee
    pub platform_fee: u128,
    /// Artist royalties
    pub artist_royalties: Vec<(Address, u128)>,
    /// Distribution timestamp
    pub distributed_at: u64,
    /// Is final
    pub final: bool,
}

// Implementations for type conversions and validation
impl MusicTrack {
    /// Create new music track
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
            release_date: 0, // Will be set on creation
            total_streams: 0,
            royalty_rate,
            active: true,
            metadata,
        }
    }
    
    /// Validate track data
    pub fn validate(&self) -> bool {
        !self.title.is_empty() && 
        !self.ipfs_hash.is_empty() && 
        !self.genre.is_empty() &&
        self.duration > 0 &&
        self.duration <= 3600 && // Max 1 hour
        self.royalty_rate > 0 &&
        self.royalty_rate <= 5000 // Max 50%
    }
    
    /// Increment stream count
    pub fn increment_streams(&mut self) {
        self.total_streams += 1;
    }
}

impl MusicNFT {
    /// Calculate royalty for secondary sale
    pub fn calculate_secondary_royalty(&self, sale_price: u128) -> u128 {
        (sale_price * u128::from(self.royalty_percentage)) / 10000
    }
    
    /// Check if NFT is transferable
    pub fn is_transferable(&self) -> bool {
        self.transferable && self.active
    }
}

impl StreamingSession {
    /// Calculate session royalty
    pub fn calculate_royalty(&self, track_royalty_rate: u32, platform_fee_rate: u32) -> (u64, u64) {
        let base_royalty = 5000; // 0.0005 XLM per stream
        let artist_royalty = (base_royalty * u64::from(track_royalty_rate)) / 10000;
        let platform_fee = (base_royalty * u64::from(platform_fee_rate)) / 10000;
        (artist_royalty, platform_fee)
    }
    
    /// Get stream quality multiplier
    pub fn get_quality_multiplier(&self) -> u32 {
        match self.quality.to_string().as_str() {
            "standard" => 100,
            "high" => 150,
            "lossless" => 200,
            "master" => 300,
            _ => 100,
        }
    }
}

impl FanToken {
    /// Calculate token price based on supply and demand
    pub fn calculate_price(&self) -> u128 {
        let supply_ratio = self.circulating_supply / self.total_supply;
        let base_price = 1000000; // 0.1 XLM base price
        base_price * (10000 - u128::from(supply_ratio)) / 10000
    }
    
    /// Mint new tokens
    pub fn mint(&mut self, amount: u128) {
        self.total_supply += amount;
        self.circulating_supply += amount;
    }
    
    /// Burn tokens
    pub fn burn(&mut self, amount: u128) {
        self.total_supply -= amount;
        self.circulating_supply -= amount;
    }
}

impl Collaboration {
    /// Validate collaboration splits
    pub fn validate_splits(&self) -> bool {
        if self.collaborators.is_empty() || self.collaborators.len() > 10 {
            return false;
        }
        
        let total_percentage: u32 = self.collaborators.iter().map(|(_, percentage)| *percentage).sum();
        total_percentage == 10000 // Must sum to 100%
    }
    
    /// Get collaborator split
    pub fn get_split(&self, collaborator: &Address) -> Option<u32> {
        self.collaborators.iter().find(|(addr, _)| addr == collaborator).map(|(_, percentage)| *percentage)
    }
}

impl LiveEvent {
    /// Check if event is currently live
    pub fn is_live(&self, current_time: u64) -> bool {
        self.active && current_time >= self.start_time && current_time <= self.end_time
    }
    
    /// Check if attendee can join
    pub fn can_join(&self, attendee_balance: u128) -> bool {
        self.active && 
        self.current_attendees < self.max_attendees &&
        attendee_balance >= self.token_requirement
    }
    
    /// Add attendee
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
    /// Check if proposal is executable
    pub fn is_executable(&self) -> bool {
        matches!(self.status, ProposalStatus::Passed) && 
        self.voting_end < env::ledger().timestamp()
    }
    
    /// Calculate voting progress
    pub fn get_voting_progress(&self) -> u32 {
        let total_votes = self.votes_for + self.votes_against + self.votes_abstain;
        if total_votes == 0 {
            return 0;
        }
        (self.votes_for * 100) / total_votes
    }
}
