import { useState } from "react";
import ControlPanel from "../ControlPanel";

export default function ControlPanelExample() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(1.25);
  const [isLooping, setIsLooping] = useState(false);
  const [randomisationMode, setRandomisationMode] = useState<
    "shuffle" | "randomise" | null
  >(null);

  return (
    <ControlPanel
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      onStop={() => {
        setIsPlaying(false);
        setCurrentTime(0);
      }}
      onExport={() => console.log("Export triggered")}
      volume={volume}
      onVolumeChange={setVolume}
      currentTime={currentTime}
      duration={3.5}
      isLooping={isLooping}
      onLoopToggle={() => setIsLooping(!isLooping)}
      randomisationMode={randomisationMode}
      onRandomise={() => setRandomisationMode("randomise")}
      onShuffle={() => setRandomisationMode("shuffle")}
      onDoneRandomise={() => setRandomisationMode(null)}
    />
  );
}
