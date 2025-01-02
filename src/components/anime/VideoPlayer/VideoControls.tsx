import { Select } from '@/components/ui/Select';
import type { StreamingSource, Subtitle } from '@/lib/api/streaming';

interface VideoControlsProps {
  sources: StreamingSource[];
  subtitles: Subtitle[];
  selectedQuality: string;
  selectedSubtitle: string;
  onQualityChange: (quality: string) => void;
  onSubtitleChange: (subtitle: string) => void;
}

export function VideoControls({
  sources,
  subtitles,
  selectedQuality,
  selectedSubtitle,
  onQualityChange,
  onSubtitleChange,
}: VideoControlsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Quality:</span>
        <Select
          value={selectedQuality}
          onValueChange={onQualityChange}
        >
          {sources.map((source) => (
            <option key={source.quality} value={source.quality}>
              {source.quality}
            </option>
          ))}
        </Select>
      </div>

      {subtitles.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Subtitles:</span>
          <Select
            value={selectedSubtitle}
            onValueChange={onSubtitleChange}
          >
            <option value="">None</option>
            {subtitles.map((subtitle) => (
              <option key={subtitle.lang} value={subtitle.lang}>
                {subtitle.lang}
              </option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
}