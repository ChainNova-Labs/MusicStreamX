/// <reference types="vite/client" />
import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];
const GENRES = ['pop', 'rock', 'hip-hop', 'jazz', 'classical', 'electronic', 'r&b', 'country', 'reggae', 'blues', 'folk', 'metal', 'other'];

interface UploadResult {
  ipfsHash: string;
  ipfsUrl: string;
  txHash: string;
  title: string;
  artist: string;
}

export function TrackUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [form, setForm] = useState({ title: '', artist: '', genre: 'pop', duration: '', artistAddress: '' });
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFileError('');
    if (f && !ALLOWED_TYPES.includes(f.type)) {
      setFileError('Only MP3, WAV, FLAC, or OGG files are allowed.');
      setFile(null);
      return;
    }
    setFile(f);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) { setErrorMsg('Please select an audio file.'); return; }

    const data = new FormData();
    data.append('audio', file);
    data.append('title', form.title);
    data.append('artist', form.artist);
    data.append('genre', form.genre);
    data.append('duration', form.duration);
    data.append('artistAddress', form.artistAddress);

    setStatus('uploading');
    setErrorMsg('');
    setResult(null);

    try {
      const res = await axios.post(`${API_BASE}/music/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
      setStatus('success');
      // Reset form
      setFile(null);
      setForm({ title: '', artist: '', genre: 'pop', duration: '', artistAddress: '' });
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      const msg = axios.isAxiosError(err) ? (err.response?.data?.error ?? err.message) : String(err);
      setErrorMsg(msg);
      setStatus('error');
    }
  }

  return (
    <div data-testid="track-upload" style={{ maxWidth: 520, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Upload Track</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="audio-file">Audio File *</label>
          <input
            id="audio-file"
            data-testid="file-input"
            ref={inputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/flac,audio/ogg"
            onChange={handleFileChange}
            style={{ display: 'block', marginTop: 4 }}
          />
          {fileError && <p data-testid="file-error" style={{ color: '#e53e3e', fontSize: 13 }}>{fileError}</p>}
        </div>

        {(['title', 'artist', 'duration', 'artistAddress'] as const).map((field) => (
          <div key={field} style={{ marginBottom: 12 }}>
            <label htmlFor={field}>{field === 'artistAddress' ? 'Artist Wallet Address *' : `${field.charAt(0).toUpperCase() + field.slice(1)} *`}</label>
            <input
              id={field}
              data-testid={`input-${field}`}
              name={field}
              type={field === 'duration' ? 'number' : 'text'}
              value={form[field]}
              onChange={handleChange}
              required
              style={{ display: 'block', width: '100%', marginTop: 4, padding: '6px 8px', boxSizing: 'border-box' }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="genre">Genre *</label>
          <select
            id="genre"
            data-testid="input-genre"
            name="genre"
            value={form.genre}
            onChange={handleChange}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: '6px 8px' }}
          >
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <button
          data-testid="submit-button"
          type="submit"
          disabled={status === 'uploading'}
          style={{ background: '#667eea', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}
        >
          {status === 'uploading' ? 'Uploading…' : 'Upload Track'}
        </button>
      </form>

      {status === 'uploading' && <p data-testid="uploading-msg">Uploading to IPFS and registering on-chain…</p>}

      {status === 'error' && (
        <p data-testid="error-msg" style={{ color: '#e53e3e', marginTop: 12 }}>{errorMsg}</p>
      )}

      {status === 'success' && result && (
        <div data-testid="success-result" style={{ marginTop: 16, padding: 16, background: '#f0fff4', borderRadius: 8 }}>
          <p>✅ Track uploaded successfully!</p>
          <p><strong>IPFS Hash:</strong> {result.ipfsHash}</p>
          <p><strong>IPFS URL:</strong> <a href={result.ipfsUrl} target="_blank" rel="noreferrer">{result.ipfsUrl}</a></p>
          <p><strong>Tx Hash:</strong> {result.txHash}</p>
        </div>
      )}
    </div>
  );
}
