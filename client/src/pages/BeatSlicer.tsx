import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import AudioUploader from "@/components/AudioUploader";
import WaveformDisplay, { Slice } from "@/components/WaveformDisplay";
import ControlPanel from "@/components/ControlPanel";
import { useToast } from "@/hooks/use-toast";
import { AudioProcessor } from "@/utils/audioProcessor";
import { Button } from "@/components/ui/button";

export default function BeatSlicer() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [slices, setSlices] = useState<Slice[]>([]);
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [sliceCount, setSliceCount] = useState(8);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const [rearrangedBuffer, setRearrangedBuffer] = useState<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  const { toast } = useToast();

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);
    audioProcessorRef.current = new AudioProcessor(audioContextRef.current);

    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  const getSliceLabel = (index: number): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (index < letters.length) {
      return letters[index];
    }
    return `${letters[index % letters.length]}${Math.floor(index / letters.length)}`;
  };

  const generateSlices = (buffer: AudioBuffer, count: number): Slice[] => {
    const sliceDuration = buffer.duration / count;
    const newSlices: Slice[] = [];

    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      newSlices.push({
        id: `slice-${i}`,
        sliceNumber: i + 1,
        sliceLabel: getSliceLabel(i),
        colorHue: hue,
        duration: sliceDuration,
        startTime: i * sliceDuration,
        endTime: (i + 1) * sliceDuration,
      });
    }

    return newSlices;
  };

  const handleFileSelect = async (file: File) => {
    setAudioFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);

      const newSlices = generateSlices(buffer, sliceCount);
      setSlices(newSlices);
      setCurrentTime(0);

      toast({
        title: "Audio loaded",
        description: `${file.name} - ${buffer.duration.toFixed(2)}s, ${sliceCount} slices created`,
      });
    } catch (error) {
      toast({
        title: "Error loading audio",
        description: "Could not decode audio file. Please try another file.",
        variant: "destructive",
      });
    }
  };

  const handleSliceCountChange = (newCount: number) => {
    setSliceCount(newCount);
    // Use current audio state (rearranged or original) as source for new slices
    const sourceBuffer = rearrangedBuffer || audioBuffer;
    if (sourceBuffer) {
      const newSlices = generateSlices(sourceBuffer, newCount);
      setSlices(newSlices);
      setCurrentTime(0);
      // Reset rearranged buffer since we're creating fresh slices
      setRearrangedBuffer(null);

      toast({
        title: "Slices updated",
        description: `Audio re-sliced into ${newCount} pieces`,
      });
    }
  };

  // Regenerate rearranged buffer when slices change
  useEffect(() => {
    if (!audioBuffer || !audioProcessorRef.current || slices.length === 0) {
      setRearrangedBuffer(null);
      return;
    }

    try {
      const newRearrangedBuffer = audioProcessorRef.current.createRearrangedBuffer(
        audioBuffer,
        slices
      );
      setRearrangedBuffer(newRearrangedBuffer);
    } catch (error) {
      console.error('Error creating rearranged buffer:', error);
      setRearrangedBuffer(null);
    }
  }, [audioBuffer, slices]);

  const handlePlayPause = () => {
    if (!audioContextRef.current) return;
    const bufferToPlay = rearrangedBuffer || audioBuffer;
    if (!bufferToPlay) return;

    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      pauseTimeRef.current = currentTime;
      setIsPlaying(false);
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = bufferToPlay;
      source.connect(gainNodeRef.current!);
      source.loop = isLooping;

      startTimeRef.current = audioContextRef.current.currentTime - pauseTimeRef.current;
      source.start(0, pauseTimeRef.current);
      sourceNodeRef.current = source;

      source.onended = () => {
        if (!isLooping) {
          setIsPlaying(false);
          setCurrentTime(0);
          pauseTimeRef.current = 0;
        }
      };

      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    pauseTimeRef.current = 0;
  };

  const handleLoopToggle = () => {
    setIsLooping(!isLooping);
    if (sourceNodeRef.current) {
      sourceNodeRef.current.loop = !isLooping;
    }
  };

  const handleExport = () => {
    if (!audioProcessorRef.current || !rearrangedBuffer) {
      toast({
        title: "Export failed",
        description: "No rearranged audio available to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      const wavBlob = audioProcessorRef.current.exportAsWav(rearrangedBuffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${audioFile?.name.replace(/\.[^/.]+$/, '') || 'rearranged'}_beat-sliced.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export complete",
        description: "Your rearranged beat has been downloaded!",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Could not export audio file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateSliceNumbers = (sliceArray: Slice[]) => {
    // Update slice numbers but preserve the original sliceLabel identifiers
    return sliceArray.map((slice) => ({
      ...slice,
    }));
  };

  const handleSliceDelete = (id: string) => {
    const filtered = slices.filter(s => s.id !== id);
    setSlices(updateSliceNumbers(filtered));
    if (selectedSliceId === id) {
      setSelectedSliceId(null);
    }
  };

  const handleSliceDuplicate = (id: string) => {
    const sliceIndex = slices.findIndex(s => s.id === id);
    if (sliceIndex === -1) return;

    const sliceToDuplicate = slices[sliceIndex];
    const newSlice: Slice = {
      ...sliceToDuplicate,
      id: `${sliceToDuplicate.id}-dup-${Date.now()}`,
    };

    const newSlices = [...slices];
    newSlices.splice(sliceIndex + 1, 0, newSlice);
    setSlices(updateSliceNumbers(newSlices));
  };

  const handleSliceClick = (slice: Slice) => {
    if (!audioContextRef.current || !audioBuffer) return;

    // Stop any currently playing audio
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }

    // Create a new source and play the slice
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gainNodeRef.current!);

    source.start(0, slice.startTime, slice.duration);
    sourceNodeRef.current = source;

    // Auto-stop after slice duration
    setTimeout(() => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
    }, slice.duration * 1000);
  };

  useEffect(() => {
    if (!isPlaying || !audioContextRef.current) return;

    const interval = setInterval(() => {
      const elapsed = audioContextRef.current!.currentTime - startTimeRef.current;
      const bufferDuration = rearrangedBuffer?.duration || audioBuffer?.duration || 0;

      if (bufferDuration > 0) {
        if (isLooping) {
          setCurrentTime(elapsed % bufferDuration);
        } else {
          setCurrentTime(elapsed);
          if (elapsed >= bufferDuration) {
            handleStop();
          }
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, audioBuffer, isLooping, slices]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {!audioFile ? (
            <AudioUploader onFileSelect={handleFileSelect} />
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    {audioFile.name}
                  </h2>
                  <button
                    onClick={() => {
                      handleStop();
                      setAudioFile(null);
                      setAudioBuffer(null);
                      setSlices([]);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-clear-audio"
                  >
                    Clear & load new file
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Slice Count:</span>
                  <div className="flex gap-2">
                    {[4, 8, 16].map((count) => (
                      <Button
                        key={count}
                        variant={sliceCount === count ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSliceCountChange(count)}
                        data-testid={`button-slice-count-${count}`}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <WaveformDisplay
                audioBuffer={audioBuffer}
                rearrangedBuffer={rearrangedBuffer}
                slices={slices}
                currentTime={currentTime}
                duration={audioBuffer?.duration || 0}
                selectedSliceId={selectedSliceId}
                onSelectSlice={setSelectedSliceId}
                onSlicesReorder={(newSlices) => setSlices(updateSliceNumbers(newSlices))}
                onSliceDelete={handleSliceDelete}
                onSliceDuplicate={handleSliceDuplicate}
                onSliceClick={handleSliceClick}
              />
            </>
          )}
        </div>
      </main>

      {audioFile && (
        <ControlPanel
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onExport={handleExport}
          volume={volume}
          onVolumeChange={setVolume}
          currentTime={currentTime}
          duration={audioBuffer?.duration || 0}
          isLooping={isLooping}
          onLoopToggle={handleLoopToggle}
        />
      )}
    </div>
  );
}
