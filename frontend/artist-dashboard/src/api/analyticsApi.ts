/// <reference types="vite/client" />
import axios from 'axios';
import type { AnalyticsData } from '../types/analytics';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export async function fetchAnalytics(artistId: string): Promise<AnalyticsData> {
  const { data } = await axios.get(`${BASE}/artists/${artistId}/analytics`);
  return data;
}
