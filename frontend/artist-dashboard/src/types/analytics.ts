export interface StreamPoint {
  date: string;   // ISO date string YYYY-MM-DD
  streams: number;
}

export interface EarningsPoint {
  date: string;
  earnings: number; // XLM
}

export interface TopTrack {
  id: string;
  title: string;
  streams: number;
  earnings: number;
}

export interface GeoEntry {
  country: string;
  listeners: number;
  percentage: number;
}

export interface AnalyticsData {
  totalStreams: number;
  totalEarnings: number;
  streamHistory: StreamPoint[];
  earningsHistory: EarningsPoint[];
  topTracks: TopTrack[];
  geoDistribution: GeoEntry[];
}
