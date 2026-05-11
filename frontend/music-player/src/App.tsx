import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';

import { Header } from './components/Header';
import { MusicPlayer } from './components/MusicPlayer';
import { TrackList } from './pages/TrackList';
import { ArtistProfile } from './pages/ArtistProfile';
import { FanPortal } from './pages/FanPortal';
import { NFTMarketplace } from './pages/NFTMarketplace';
import { LiveEvents } from './pages/LiveEvents';
import { useThemeStore } from './store/themeStore';
import { wagmiConfig, rainbowKitTheme, chains } from './utils/walletConfig';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function App() {
  const { isDarkMode } = useThemeStore();

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={rainbowKitTheme}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className={`min-h-screen ${isDarkMode ? 'dark' : 'light'}`}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900"
              >
                <Header />
                <MusicPlayer />

                <main className="container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<TrackList />} />
                    <Route path="/tracks" element={<TrackList />} />
                    <Route path="/artist/:address" element={<ArtistProfile />} />
                    <Route path="/fan-portal" element={<FanPortal />} />
                    <Route path="/nft-marketplace" element={<NFTMarketplace />} />
                    <Route path="/live-events" element={<LiveEvents />} />
                  </Routes>
                </main>
              </motion.div>
            </div>
          </Router>
        </QueryClientProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
