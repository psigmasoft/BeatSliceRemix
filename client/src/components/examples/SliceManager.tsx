import { useState } from 'react';
import SliceManager, { Slice } from '../SliceManager';

export default function SliceManagerExample() {
  const [slices, setSlices] = useState<Slice[]>([
    { id: '1', sliceNumber: 1, duration: 0.125, startTime: 0, endTime: 0.125 },
    { id: '2', sliceNumber: 2, duration: 0.125, startTime: 0.125, endTime: 0.25 },
    { id: '3', sliceNumber: 3, duration: 0.125, startTime: 0.25, endTime: 0.375 },
    { id: '4', sliceNumber: 4, duration: 0.125, startTime: 0.375, endTime: 0.5 },
    { id: '5', sliceNumber: 5, duration: 0.125, startTime: 0.5, endTime: 0.625 },
    { id: '6', sliceNumber: 6, duration: 0.125, startTime: 0.625, endTime: 0.75 },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <SliceManager
      slices={slices}
      onSlicesChange={setSlices}
      selectedSliceId={selectedId}
      onSelectSlice={setSelectedId}
    />
  );
}
