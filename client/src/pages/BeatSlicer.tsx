import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import AudioUploader from "@/components/AudioUploader";
import WaveformDisplay, { Slice } from "@/components/WaveformDisplay";
import ControlPanel from "@/components/ControlPanel";
import { useToast } from "@/hooks/use-toast";
import { AudioProcessor, fisherYatesShuffle } from "@/utils/audioProcessor";
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
  const [rearrangedBuffer, setRearrangedBuffer] = useState<AudioBuffer | null>(
    null
  );
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  const { toast } = useToast();

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
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
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (index < letters.length) {
      return letters[index];
    }
    return `${letters[index % letters.length]}${Math.floor(
      index / letters.length
    )}`;
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
      const buffer = await audioContextRef.current!.decodeAudioData(
        arrayBuffer
      );
      setAudioBuffer(buffer);

      const newSlices = generateSlices(buffer, sliceCount);
      setSlices(newSlices);
      setCurrentTime(0);

      toast({
        title: "Audio loaded",
        description: `${file.name} - ${buffer.duration.toFixed(
          2
        )}s, ${sliceCount} slices created`,
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
      const newRearrangedBuffer =
        audioProcessorRef.current.createRearrangedBuffer(audioBuffer, slices);
      setRearrangedBuffer(newRearrangedBuffer);
    } catch (error) {
      console.error("Error creating rearranged buffer:", error);
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

      startTimeRef.current =
        audioContextRef.current.currentTime - pauseTimeRef.current;
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
      const a = document.createElement("a");
      a.href = url;
      a.download = `${
        audioFile?.name.replace(/\.[^/.]+$/, "") || "rearranged"
      }_beat-sliced.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export complete",
        description: "Your rearranged beat has been downloaded!",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Could not export audio file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateSliceNumbers = (sliceArray: Slice[]) => {
    // Simply return the array as-is
    // startTime/endTime represent positions in ORIGINAL audio and must NOT change when reordering
    // Only the array order changes, which determines playback sequence
    return sliceArray;
  };

  const handleSliceDelete = (id: string) => {
    const filtered = slices.filter((s) => s.id !== id);
    setSlices(updateSliceNumbers(filtered));
    if (selectedSliceId === id) {
      setSelectedSliceId(null);
    }
  };

  const handleSliceDuplicate = (id: string) => {
    const sliceIndex = slices.findIndex((s) => s.id === id);
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

  const handleShuffle = () => {
    const shuffledSlices = fisherYatesShuffle(slices);
    setSlices(shuffledSlices);
    toast({
      title: "Slice order randomised",
      description: "Slices have been shuffled into a random order",
    });
  };

  const loadDefaultAudio = async (filename: string) => {
    try {
      // Stop any playing audio
      handleStop();

      // Fetch the audio file from the public directory
      const response = await fetch(`/DEFAULT_LOOPS/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`);
      }

      // Convert response to blob and then to a File object
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });

      // Clear existing state
      setAudioFile(null);
      setAudioBuffer(null);
      setSlices([]);
      setRearrangedBuffer(null);

      // Process the file like a normal upload
      handleFileSelect(file);

      toast({
        title: "Default audio loaded",
        description: `${filename} has been loaded and processed`,
      });
    } catch (error) {
      console.error("Error loading default audio:", error);
      toast({
        title: "Error loading default audio",
        description: `Could not load ${filename}. Please try again.`,
        variant: "destructive",
      });
    }
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
      const elapsed =
        audioContextRef.current!.currentTime - startTimeRef.current;
      const bufferDuration =
        rearrangedBuffer?.duration || audioBuffer?.duration || 0;

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
        <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {!audioFile ? (
            <>
              <div className="flex justify-end mb-4">
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="default"
                    onClick={() => loadDefaultAudio("SummerHaze.wav")}
                    className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
                    data-testid="button-load-summer-haze"
                  >
                    summer haze
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => loadDefaultAudio("EliphinoBreak.wav")}
                    className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
                    data-testid="button-load-eliphino"
                  >
                    eliphino
                  </Button>
                </div>
              </div>
              <AudioUploader onFileSelect={handleFileSelect} />
            </>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground truncate flex-1">
                    {audioFile.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-end sm:items-center">
                    <Button
                      variant="default"
                      onClick={() => {
                        handleStop();
                        setAudioFile(null);
                        setAudioBuffer(null);
                        setSlices([]);
                        setRearrangedBuffer(null);
                      }}
                      className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
                      data-testid="button-clear-audio"
                    >
                      clear
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => loadDefaultAudio("SummerHaze.wav")}
                      className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
                      data-testid="button-load-summer-haze"
                    >
                      summer haze
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => loadDefaultAudio("EliphinoBreak.wav")}
                      className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
                      data-testid="button-load-eliphino"
                    >
                      eliphino
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    Slice Count:
                  </span>
                  <div className="flex gap-2">
                    {[4, 8, 16].map((count) => (
                      <Button
                        key={count}
                        variant={sliceCount === count ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSliceCountChange(count)}
                        data-testid={`button-slice-count-${count}`}
                        className="text-xs sm:text-sm"
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
                onSlicesReorder={(newSlices) =>
                  setSlices(updateSliceNumbers(newSlices))
                }
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
          randomisationMode={null}
          onShuffle={handleShuffle}
        />
      )}
    </div>
  );
}
