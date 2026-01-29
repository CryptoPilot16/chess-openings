'use client';

import { useState, useEffect } from 'react';
import OpeningSelector from '@/components/OpeningSelector';
import TrainingMode from '@/components/TrainingMode';
import { openings, Opening } from '@/data/openings';

export default function Home() {
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null);

  if (typeof window === 'undefined') {
    return null;
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
