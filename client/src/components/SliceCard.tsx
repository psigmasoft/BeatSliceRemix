import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SliceCardProps {
  sliceNumber: number;
  duration: number;
  isSelected: boolean;
  onDelete: () => void;
  onSelect: () => void;
  isDragging?: boolean;
}

export default function SliceCard({
  sliceNumber,
  duration,
  isSelected,
  onDelete,
  onSelect,
  isDragging = false,
}: SliceCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative w-24 h-24 sm:w-32 sm:h-28 rounded-md border-2 bg-card cursor-grab touch-none
        transition-all duration-150 hover-elevate
        ${isSelected ? 'border-chart-3 shadow-lg shadow-chart-3/20' : 'border-card-border'}
        ${isDragging ? 'opacity-50 shadow-xl' : ''}
      `}
      data-testid={`card-slice-${sliceNumber}`}
    >
      <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-accent text-accent-foreground text-xs font-mono px-1.5 sm:px-2 py-0.5 rounded">
        #{sliceNumber}
      </div>
      
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1 right-1 h-7 w-7 sm:h-6 sm:w-6 text-destructive hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        data-testid={`button-delete-${sliceNumber}`}
        title="Delete slice"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="absolute inset-0 flex items-center justify-center pt-3 sm:pt-4">
        <GripVertical className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
      </div>

      <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2 text-center">
        <div className="text-xs text-muted-foreground font-mono">
          {duration.toFixed(3)}s
        </div>
      </div>
    </div>
  );
}
