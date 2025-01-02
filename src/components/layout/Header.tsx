import { Link } from 'react-router-dom';
import { Menu, Search, User, Tv, Flame, Clock, Sparkles, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';

export function Header() {
  const { user, clearAuth } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center"
          >
            <Sparkles className="h-8 w-8 text-purple-500" />
            <span className="font-black text-2xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent font-['Cyberpunk']">
              AnimeRadar
            </span>
          </motion.div>
        </Link>

        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          <Button variant="ghost" asChild>
            <Link to="/latest" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Latest</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/popular" className="flex items-center space-x-2">
              <Flame className="h-4 w-4" />
              <span>Popular</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/trending" className="flex items-center space-x-2">
              <Tv className="h-4 w-4" />
              <span>Trending</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/seasonal" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Seasonal</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/genres">
              <span>Genres</span>
            </Link>
          </Button>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => clearAuth()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}