#![no_std]
use soroban_sdk::contracterror;

#[contracterror]
#[derive(Clone, Copy, Eq, PartialEq)]
pub enum ContractError {
    Unauthorized = 1,
    InvalidConfiguration = 2,
    TrackNotFound = 3,
    NFTNotFound = 4,
    InsufficientBalance = 5,
    InvalidSplit = 6,
    EventNotActive = 7,
    ProposalNotFound = 8,
    AlreadyVoted = 9,
    VotingClosed = 10,
    ContractPaused = 11,
    InvalidMetadata = 12,
    MaxAttendeesReached = 13,
    InvalidRoyaltyRate = 14,
}
