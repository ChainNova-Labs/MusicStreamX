/// <reference types="vite/client" />
import axios from 'axios';
import type { NFT, BuyResult } from '../types/nft';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
const api = axios.create({ baseURL: BASE });

export async function fetchListedNFTs(page = 1, limit = 20): Promise<{ nfts: NFT[]; total: number }> {
  const { data } = await api.get('/nft', { params: { page, limit, listed: true } });
  return data;
}

export async function fetchNFT(id: string): Promise<NFT> {
  const { data } = await api.get(`/nft/${id}`);
  return data;
}

export async function listNFT(id: string, price: number, sellerId: string): Promise<NFT> {
  const { data } = await api.post(`/nft/${id}/list`, { price, sellerId });
  return data.data;
}

export async function delistNFT(id: string, sellerId: string): Promise<NFT> {
  const { data } = await api.post(`/nft/${id}/delist`, { sellerId });
  return data.data;
}

export async function buyNFT(id: string, buyerId: string): Promise<BuyResult> {
  const { data } = await api.post(`/nft/${id}/buy`, { buyerId });
  return data;
}
