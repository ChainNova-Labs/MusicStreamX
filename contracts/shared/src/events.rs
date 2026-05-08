#![no_std]
use soroban_sdk::{contracttype, Address, Bytes};

#[contracttype]
#[derive(Clone)]
pub enum ContractEvent {
    TrackCreated(Bytes),
    TrackStreamed(Bytes, Address),
    NFTMinted(Bytes, Address),
    NFTTransferred(Bytes, Address, Address),
    RoyaltyDistributed(Bytes, u128),
    ProposalCreated(Bytes),
    VoteCast(Bytes, Address),
    ProposalExecuted(Bytes),
    LiveEventStarted(Bytes),
    LiveEventEnded(Bytes),
    FanTokenMinted(Bytes, u128),
}
