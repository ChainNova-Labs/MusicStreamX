import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoyaltyAnalyticsDashboard } from '../pages/RoyaltyAnalyticsDashboard';
import type { AnalyticsData } from '../types/analytics';

const mockFetch = vi.fn();
vi.mock('../api/analyticsApi', () => ({
  fetchAnalytics: (...args: unknown[]) => mockFetch(...args),
}));

const mockData: AnalyticsData = {
  totalStreams: 5000,
  totalEarnings: 20.0,
  streamHistory: Array.from({ length: 30 }, (_, i) => ({
    date: `2026-04-${String(i + 1).padStart(2, '0')}`,
    streams: 100 + i * 10,
  })),
  earningsHistory: Array.from({ length: 30 }, (_, i) => ({
    date: `2026-04-${String(i + 1).padStart(2, '0')}`,
    earnings: 0.4 + i * 0.04,
  })),
  topTracks: [
    { id: '1', title: 'Track Alpha', streams: 1200, earnings: 4.8 },
    { id: '2', title: 'Track Beta', streams: 980, earnings: 3.92 },
  ],
  geoDistribution: [
    { country: 'United States', listeners: 4200, percentage: 35.0 },
    { country: 'United Kingdom', listeners: 1800, percentage: 15.0 },
  ],
};

describe('RoyaltyAnalyticsDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<RoyaltyAnalyticsDashboard />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders dashboard after data loads', async () => {
    mockFetch.mockResolvedValue(mockData);
    render(<RoyaltyAnalyticsDashboard />);
    await waitFor(() => expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument());
    expect(screen.getByTestId('total-streams')).toHaveTextContent('5,000');
    expect(screen.getByTestId('total-earnings')).toHaveTextContent('20.00 XLM');
  });

  it('renders stream and earnings line charts', async () => {
    mockFetch.mockResolvedValue(mockData);
    render(<RoyaltyAnalyticsDashboard />);
    await waitFor(() => expect(screen.getAllByTestId('line-chart')).toHaveLength(2));
  });

  it('renders top tracks bar chart and table rows', async () => {
    mockFetch.mockResolvedValue(mockData);
    render(<RoyaltyAnalyticsDashboard />);
    await waitFor(() => expect(screen.getByTestId('bar-chart')).toBeInTheDocument());
    expect(screen.getAllByTestId('top-track-row')).toHaveLength(2);
    expect(screen.getByText('Track Alpha')).toBeInTheDocument();
  });

  it('renders geographic distribution table', async () => {
    mockFetch.mockResolvedValue(mockData);
    render(<RoyaltyAnalyticsDashboard />);
    await waitFor(() => expect(screen.getByTestId('geo-table')).toBeInTheDocument());
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<RoyaltyAnalyticsDashboard />);
    await waitFor(() => expect(screen.getByTestId('error')).toBeInTheDocument());
  });
});
