import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
   Play,
   Pause,
   Square,
   Download,
   Volume2,
   Repeat,
   Shuffle,
 } from "lucide-react";

interface ControlPanelProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onExport: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  onLoopToggle: () => void;
  randomisationMode: "shuffle" | null;
  onShuffle: () => void;
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
   isLooping,
   onLoopToggle,
   randomisationMode,
   onShuffle,
 }: ControlPanelProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card border-t border-border p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
          {/* Control buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
            <Button
              size="icon"
              variant="default"
              onClick={onPlayPause}
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full"
              data-testid="button-play-pause"
              title={isPlaying ? "Pause" : "Play"}
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
              className="h-10 w-10"
              data-testid="button-stop"
              title="Stop"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={isLooping ? "default" : "outline"}
              onClick={onLoopToggle}
              className="toggle-elevate h-10 w-10"
              data-testid="button-loop-toggle"
              title="Toggle loop"
            >
              <Repeat className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={onShuffle}
              title="Randomise slice order"
              className="transition-all duration-200 hover:scale-110 active:scale-95 h-10 w-10"
              data-testid="button-shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>

          {/* Time display and progress bar */}
          <div className="flex-1 flex items-center gap-2 sm:gap-4 w-full sm:w-auto min-h-8">
            <div className="text-xs sm:text-sm font-mono text-foreground min-w-fit">
              {formatTime(currentTime)}
            </div>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-16">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{
                  width: `${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%`,
                }}
              />
            </div>
            <div className="text-xs sm:text-sm font-mono text-muted-foreground min-w-fit text-right">
              {formatTime(duration)}
            </div>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2 sm:gap-3 w-32 sm:w-48">
            <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[volume * 100]}
              onValueChange={(values) => onVolumeChange(values[0] / 100)}
              max={100}
              step={1}
              className="flex-1"
              data-testid="slider-volume"
            />
          </div>

          {/* Export button */}
          <Button
            variant="default"
            onClick={onExport}
            className="ml-0 sm:ml-4 h-10 w-10 sm:w-auto sm:px-4"
            data-testid="button-export"
            title="Export audio"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
