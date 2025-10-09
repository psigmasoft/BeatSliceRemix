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
        relative w-32 h-28 rounded-md border-2 bg-card cursor-grab
        transition-all duration-150 hover-elevate
        ${isSelected ? 'border-chart-3 shadow-lg shadow-chart-3/20' : 'border-card-border'}
        ${isDragging ? 'opacity-50 shadow-xl' : ''}
      `}
      data-testid={`card-slice-${sliceNumber}`}
    >
      <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-mono px-2 py-0.5 rounded">
        #{sliceNumber}
      </div>
      
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1 right-1 h-6 w-6 text-destructive hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        data-testid={`button-delete-${sliceNumber}`}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="absolute inset-0 flex items-center justify-center pt-4">
        <GripVertical className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="absolute bottom-2 left-2 right-2 text-center">
        <div className="text-xs text-muted-foreground font-mono">
          {duration.toFixed(3)}s
        </div>
      </div>
    </div>
  );
}
