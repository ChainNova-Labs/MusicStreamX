import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrackUpload } from '../components/TrackUpload';

const mockPost = vi.fn();

vi.mock('axios', () => ({
  default: {
    post: (...args: unknown[]) => mockPost(...args),
    isAxiosError: (e: unknown) => (e as { isAxiosError?: boolean }).isAxiosError === true,
  },
}));

function fillForm() {
  fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'My Track' } });
  fireEvent.change(screen.getByTestId('input-artist'), { target: { value: 'Cool Artist' } });
  fireEvent.change(screen.getByTestId('input-duration'), { target: { value: '180' } });
  fireEvent.change(screen.getByTestId('input-artistAddress'), { target: { value: 'GXXX' } });
}

describe('TrackUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the upload form', () => {
    render(<TrackUpload />);
    expect(screen.getByTestId('track-upload')).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('shows file type error for non-audio files', async () => {
    render(<TrackUpload />);
    const input = screen.getByTestId('file-input');
    // Simulate onChange with a non-audio file directly
    const file = new File(['data'], 'test.txt', { type: 'text/plain' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(screen.getByTestId('file-error')).toBeInTheDocument();
  });

  it('accepts valid audio files without error', async () => {
    render(<TrackUpload />);
    const file = new File(['data'], 'track.mp3', { type: 'audio/mpeg' });
    const input = screen.getByTestId('file-input');
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(screen.queryByTestId('file-error')).not.toBeInTheDocument();
  });

  it('shows success result after successful upload', async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        data: {
          ipfsHash: 'QmTestHash1234567890123456789012345678901234567',
          ipfsUrl: 'https://ipfs.io/ipfs/QmTestHash1234567890123456789012345678901234567',
          txHash: 'tx_123_QmTestHa',
          title: 'My Track',
          artist: 'Cool Artist',
        },
      },
    });

    render(<TrackUpload />);
    const file = new File(['data'], 'track.mp3', { type: 'audio/mpeg' });
    await act(async () => {
      fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    });
    fillForm();
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(screen.getByTestId('success-result')).toBeInTheDocument());
    // Use getAllByText since the hash appears in both the <p> and the <a>
    expect(screen.getAllByText(/QmTestHash/).length).toBeGreaterThan(0);
    expect(screen.getByText(/tx_123/)).toBeInTheDocument();
  });

  it('shows error message on upload failure', async () => {
    const err = { isAxiosError: true, response: { data: { error: 'IPFS unavailable' } }, message: 'err' };
    mockPost.mockRejectedValue(err);

    render(<TrackUpload />);
    const file = new File(['data'], 'track.mp3', { type: 'audio/mpeg' });
    await act(async () => {
      fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    });
    fillForm();
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(screen.getByTestId('error-msg')).toBeInTheDocument());
    expect(screen.getByTestId('error-msg').textContent).toContain('IPFS unavailable');
  });

  it('disables submit button while uploading', async () => {
    mockPost.mockReturnValue(new Promise(() => {})); // never resolves
    render(<TrackUpload />);
    const file = new File(['data'], 'track.mp3', { type: 'audio/mpeg' });
    await act(async () => {
      fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
    });
    fillForm();
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(screen.getByTestId('submit-button')).toBeDisabled());
    expect(screen.getByTestId('uploading-msg')).toBeInTheDocument();
  });
});
