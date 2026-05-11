import { WalletConnect } from './WalletConnect';
import { useThemeStore } from '../store/themeStore';

export function Header() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid #e2e8f0' }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>🎵 MusicStreamX</h1>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={toggleDarkMode} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <WalletConnect />
      </div>
    </header>
  );
}
