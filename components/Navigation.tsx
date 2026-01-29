'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Trophy, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { areSoundsEnabled, toggleSounds } from '@/lib/sound';

export default function Navigation() {
  const pathname = usePathname();
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSoundsEnabled(areSoundsEnabled());
  }, []);

  const handleSoundToggle = () => {
    const newState = toggleSounds();
    setSoundsEnabled(newState);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-blue-400 transition">
            ♟️ Chess Trainer
          </Link>

          {/* Navigation Links & Controls */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              href="/progress"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/progress')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BarChart3 size={18} />
              <span className="hidden sm:inline">Progress</span>
            </Link>

            <Link
              href="/achievements"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/achievements')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Trophy size={18} />
              <span className="hidden sm:inline">Achievements</span>
            </Link>

            {/* Sound Toggle */}
            {mounted && (
              <button
                onClick={handleSoundToggle}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-yellow-400 hover:text-yellow-300 transition"
                aria-label="Toggle sound effects"
              >
                {soundsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
