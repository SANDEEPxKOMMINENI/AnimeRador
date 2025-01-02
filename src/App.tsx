import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Header } from '@/components/layout/Header';
import { HomePage } from '@/pages/HomePage';
import { LatestAnimePage } from '@/pages/LatestAnimePage';
import { PopularAnimePage } from '@/pages/PopularAnimePage';
import { TrendingAnimePage } from '@/pages/TrendingAnimePage';
import { SeasonalAnimePage } from '@/pages/SeasonalAnimePage';
import { GenresPage } from '@/pages/GenresPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SearchPage } from '@/pages/SearchPage';
import { AnimeDetailsPage } from '@/pages/AnimeDetailsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { WatchPage } from '@/pages/WatchPage';
import { Toaster } from '@/components/ui/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="relative min-h-screen bg-background font-sans antialiased">
          <Header />
          <main className="container py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/latest" element={<LatestAnimePage />} />
              <Route path="/popular" element={<PopularAnimePage />} />
              <Route path="/trending" element={<TrendingAnimePage />} />
              <Route path="/seasonal" element={<SeasonalAnimePage />} />
              <Route path="/genres" element={<GenresPage />} />
              <Route path="/genre/:genre" element={<GenresPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/anime/:id" element={<AnimeDetailsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route
                path="/watch/:animeId/:episodeId"
                element={<WatchPage />}
              />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
