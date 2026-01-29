'use client';

import { useState, useEffect } from 'react';
import OpeningSelector from '@/components/OpeningSelector';
import TrainingMode from '@/components/TrainingMode';
import { openings, Opening } from '@/data/openings';

export default function Home() {
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto p-8 text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </main>
    );
  }

  if (selectedOpening) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
        <TrainingMode
          opening={selectedOpening}
          onComplete={() => {
            setSelectedOpening(null);
          }}
          onQuit={() => setSelectedOpening(null)}
        />
      </main>
    );
  }

  return (
    <OpeningSelector
      openings={openings}
      onSelect={setSelectedOpening}
    />
  );
}
