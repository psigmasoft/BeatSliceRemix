import { useState } from 'react';
import WaveformDisplay, { Slice } from '../WaveformDisplay';

export default function WaveformDisplayExample() {
  const mockAudioBuffer = {
    length: 44100,
    duration: 1.0,
    sampleRate: 44100,
    numberOfChannels: 1,
    getChannelData: () => {
      const data = new Float32Array(44100);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.sin(i / 100) * 0.5;
      }
      return data;
    },
    copyFromChannel: () => {},
    copyToChannel: () => {},
  } as unknown as AudioBuffer;

  const [slices, setSlices] = useState<Slice[]>([
    { id: '1', sliceNumber: 1, duration: 0.25, startTime: 0, endTime: 0.25 },
    { id: '2', sliceNumber: 2, duration: 0.25, startTime: 0.25, endTime: 0.5 },
    { id: '3', sliceNumber: 3, duration: 0.25, startTime: 0.5, endTime: 0.75 },
    { id: '4', sliceNumber: 4, duration: 0.25, startTime: 0.75, endTime: 1.0 },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDuplicate = (id: string) => {
    const sliceIndex = slices.findIndex(s => s.id === id);
    if (sliceIndex === -1) return;
    
    const newSlice = { ...slices[sliceIndex], id: `${slices[sliceIndex].id}-dup` };
    const newSlices = [...slices];
    newSlices.splice(sliceIndex + 1, 0, newSlice);
    setSlices(newSlices);
  };

  return (
    <WaveformDisplay
      audioBuffer={mockAudioBuffer}
      slices={slices}
      currentTime={0.3}
      duration={1.0}
      selectedSliceId={selectedId}
      onSelectSlice={setSelectedId}
      onSlicesReorder={setSlices}
      onSliceDelete={(id) => setSlices(slices.filter(s => s.id !== id))}
      onSliceDuplicate={handleDuplicate}
    />
  );
}
