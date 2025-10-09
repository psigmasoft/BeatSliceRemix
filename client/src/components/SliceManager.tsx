import { useState } from "react";
import SliceCard from "./SliceCard";
import { Button } from "@/components/ui/button";
import { Plus, Copy } from "lucide-react";

export interface Slice {
  id: string;
  sliceNumber: number;
  duration: number;
  startTime: number;
  endTime: number;
}

interface SliceManagerProps {
  slices: Slice[];
  onSlicesChange: (slices: Slice[]) => void;
  selectedSliceId: string | null;
  onSelectSlice: (id: string | null) => void;
}

export default function SliceManager({
  slices,
  onSlicesChange,
  selectedSliceId,
  onSelectSlice,
}: SliceManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newSlices = [...slices];
    const [removed] = newSlices.splice(draggedIndex, 1);
    newSlices.splice(dropIndex, 0, removed);

    onSlicesChange(newSlices);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDelete = (id: string) => {
    onSlicesChange(slices.filter(s => s.id !== id));
    if (selectedSliceId === id) {
      onSelectSlice(null);
    }
  };

  const handleDuplicate = (id: string) => {
    const sliceIndex = slices.findIndex(s => s.id === id);
    if (sliceIndex === -1) return;
    
    const sliceToDuplicate = slices[sliceIndex];
    const newSlice: Slice = {
      ...sliceToDuplicate,
      id: `${sliceToDuplicate.id}-dup-${Date.now()}`,
    };
    
    const newSlices = [...slices];
    newSlices.splice(sliceIndex + 1, 0, newSlice);
    onSlicesChange(newSlices);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="text-sm font-medium text-foreground">
          Slice Arrangement
          <span className="ml-2 text-muted-foreground font-mono">
            {slices.length} slices
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => selectedSliceId && handleDuplicate(selectedSliceId)}
            disabled={!selectedSliceId}
            data-testid="button-duplicate-slice"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 rounded-md p-4 border border-border min-h-40">
        <div className="flex flex-wrap gap-3">
          {slices.map((slice, index) => (
            <div
              key={slice.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`
                transition-opacity
                ${dragOverIndex === index && draggedIndex !== index ? 'opacity-50' : ''}
              `}
            >
              <SliceCard
                sliceNumber={slice.sliceNumber}
                duration={slice.duration}
                isSelected={selectedSliceId === slice.id}
                onSelect={() => onSelectSlice(slice.id)}
                onDelete={() => handleDelete(slice.id)}
                isDragging={draggedIndex === index}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
