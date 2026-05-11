export interface NFT {
  id: string;
  trackId: string;
  artistId: string;
  ownerId: string;
  edition: number;
  price: number;
  royaltyPercent: number;
  listed: boolean;
  createdAt: string;
  // Optional display fields
  title?: string;
  artist?: string;
  imageUrl?: string;
}

export interface BuyResult {
  message: string;
  nft: NFT;
  transaction: {
    salePrice: number;
    previousOwner: string;
    newOwner: string;
    artistId: string;
    isSecondarySale: boolean;
    distribution: {
      sellerAmount: number;
      royaltyAmount: number;
      platformFee: number;
    };
  };
}
