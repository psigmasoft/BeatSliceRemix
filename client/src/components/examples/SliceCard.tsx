import { useState } from 'react';
import SliceCard from '../SliceCard';

export default function SliceCardExample() {
  const [selected, setSelected] = useState(false);

  return (
    <div className="p-8">
      <SliceCard
        sliceNumber={1}
        duration={0.125}
        isSelected={selected}
        onSelect={() => setSelected(!selected)}
        onDelete={() => console.log('Delete slice 1')}
      />
    </div>
  );
}
