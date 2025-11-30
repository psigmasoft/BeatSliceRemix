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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 px-2">
        <div className="text-xs sm:text-sm font-medium text-foreground">
          Slice Arrangement
          <span className="ml-2 text-muted-foreground font-mono text-xs">
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
            className="text-xs sm:text-sm"
          >
            <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Duplicate</span>
            <span className="sm:hidden">Dup</span>
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 rounded-md p-2 sm:p-4 border border-border min-h-32 sm:min-h-40 overflow-x-auto">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {slices.map((slice, index) => (
            <div
              key={slice.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`
                transition-opacity flex-shrink-0
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
