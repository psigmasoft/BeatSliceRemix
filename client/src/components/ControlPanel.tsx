import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Download, Volume2 } from "lucide-react";

interface ControlPanelProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onExport: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  currentTime: number;
  duration: number;
}

export default function ControlPanel({
  isPlaying,
  onPlayPause,
  onStop,
  onExport,
  volume,
  onVolumeChange,
  currentTime,
  duration,
}: ControlPanelProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border-t border-border p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="default"
              onClick={onPlayPause}
              className="h-12 w-12 rounded-full"
              data-testid="button-play-pause"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={onStop}
              data-testid="button-stop"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 flex items-center gap-4">
            <div className="text-sm font-mono text-foreground min-w-24">
              {formatTime(currentTime)}
            </div>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="text-sm font-mono text-muted-foreground min-w-24 text-right">
              {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-3 w-48">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              onValueChange={(values) => onVolumeChange(values[0] / 100)}
              max={100}
              step={1}
              className="flex-1"
              data-testid="slider-volume"
            />
          </div>

          <Button
            variant="default"
            onClick={onExport}
            className="ml-4"
            data-testid="button-export"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
