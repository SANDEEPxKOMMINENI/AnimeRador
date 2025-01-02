
import { useState } from 'react';
import { useQuery } from 'react-query';
import { Loader } from 'lucide-react';
import { AMVPlayer } from './AMVPlayer';
import { AMVThumbnail } from './AMVThumbnail';
import { getAnimeAMVs } from '@/lib/api/amv';
import type { AMV } from '@/types';

interface AMVSectionProps {
  animeTitle: string;
}

export function AMVSection({ animeTitle }: AMVSectionProps) {
  const [selectedAMV, setSelectedAMV] = useState<AMV | null>(null);

  const { data: amvs, isLoading } = useQuery(
    ['amvs', animeTitle],
    () => getAnimeAMVs(animeTitle),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!amvs?.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Fan-Made AMVs</h2>
      
      {selectedAMV ? (
        <AMVPlayer amv={selectedAMV} onClose={() => setSelectedAMV(null)} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {amvs.map((amv) => (
            <AMVThumbnail
              key={amv.id}
              amv={amv}
              onClick={() => setSelectedAMV(amv)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
