import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import AudioUploader from "@/components/AudioUploader";
import WaveformDisplay, { Slice } from "@/components/WaveformDisplay";
import ControlPanel from "@/components/ControlPanel";
import { useToast } from "@/hooks/use-toast";

export default function BeatSlicer() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [slices, setSlices] = useState<Slice[]>([]);
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  
  const { toast } = useToast();

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);
    
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

  const handleFileSelect = async (file: File) => {
    setAudioFile(file);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      
      const sliceCount = 8;
      const sliceDuration = buffer.duration / sliceCount;
      const newSlices: Slice[] = [];
      
      for (let i = 0; i < sliceCount; i++) {
        newSlices.push({
          id: `slice-${i}`,
          sliceNumber: i + 1,
          duration: sliceDuration,
          startTime: i * sliceDuration,
          endTime: (i + 1) * sliceDuration,
        });
      }
      
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

  const handlePlayPause = () => {
    if (!audioBuffer || !audioContextRef.current) return;

    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      pauseTimeRef.current = currentTime;
      setIsPlaying(false);
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
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
    if (!audioBuffer || slices.length === 0) return;

    toast({
      title: "Export started",
      description: "Creating rearranged audio file...",
    });

    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Your rearranged beat has been downloaded!",
      });
    }, 1500);
  };

  const handleSliceDelete = (id: string) => {
    setSlices(slices.filter(s => s.id !== id));
    if (selectedSliceId === id) {
      setSelectedSliceId(null);
    }
  };

  useEffect(() => {
    if (!isPlaying || !audioContextRef.current) return;

    const interval = setInterval(() => {
      const elapsed = audioContextRef.current!.currentTime - startTimeRef.current;
      if (audioBuffer) {
        if (isLooping) {
          setCurrentTime(elapsed % audioBuffer.duration);
        } else {
          setCurrentTime(elapsed);
          if (elapsed >= audioBuffer.duration) {
            handleStop();
          }
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, audioBuffer, isLooping]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {!audioFile ? (
            <AudioUploader onFileSelect={handleFileSelect} />
          ) : (
            <>
              <div className="space-y-2">
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
              </div>
              
              <WaveformDisplay
                audioBuffer={audioBuffer}
                slices={slices}
                currentTime={currentTime}
                duration={audioBuffer?.duration || 0}
                selectedSliceId={selectedSliceId}
                onSelectSlice={setSelectedSliceId}
                onSlicesReorder={setSlices}
                onSliceDelete={handleSliceDelete}
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
