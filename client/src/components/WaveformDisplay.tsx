import { useEffect, useRef, useState } from "react";
import { GripVertical, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Slice {
  id: string;
  sliceNumber: number;
  duration: number;
  startTime: number;
  endTime: number;
}

interface WaveformDisplayProps {
  audioBuffer: AudioBuffer | null;
  slices: Slice[];
  currentTime: number;
  duration: number;
  selectedSliceId: string | null;
  onSelectSlice: (id: string | null) => void;
  onSlicesReorder: (slices: Slice[]) => void;
  onSliceDelete: (id: string) => void;
  onSliceDuplicate: (id: string) => void;
}

export default function WaveformDisplay({
  audioBuffer,
  slices,
  currentTime,
  duration,
  selectedSliceId,
  onSelectSlice,
  onSlicesReorder,
  onSliceDelete,
  onSliceDuplicate,
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedSliceId, setDraggedSliceId] = useState<string | null>(null);
  const [dragOverSliceId, setDragOverSliceId] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.fillStyle = 'hsl(220, 12%, 16%)';
    ctx.fillRect(0, 0, width, height);

    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / width);
    const amp = height / 2;

    ctx.strokeStyle = 'hsl(200, 70%, 60%)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
      const min = channelData.slice(i * step, (i + 1) * step).reduce((a, b) => Math.min(a, b), 0);
      const max = channelData.slice(i * step, (i + 1) * step).reduce((a, b) => Math.max(a, b), 0);
      
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    
    ctx.stroke();

    slices.forEach((slice, index) => {
      if (index > 0) {
        const x = (slices.slice(0, index).reduce((acc, s) => acc + s.duration, 0) / duration) * width;
        ctx.strokeStyle = 'hsl(280, 60%, 65%)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    });

    if (currentTime > 0) {
      const x = (currentTime / duration) * width;
      ctx.strokeStyle = 'hsl(0, 70%, 55%)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }, [audioBuffer, slices, currentTime, duration]);

  const handleDragStart = (e: React.DragEvent, sliceId: string) => {
    setDraggedSliceId(sliceId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, sliceId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSliceId(sliceId);
  };

  const handleDrop = (e: React.DragEvent, dropSliceId: string) => {
    e.preventDefault();
    if (!draggedSliceId || draggedSliceId === dropSliceId) {
      setDraggedSliceId(null);
      setDragOverSliceId(null);
      return;
    }

    const draggedIndex = slices.findIndex(s => s.id === draggedSliceId);
    const dropIndex = slices.findIndex(s => s.id === dropSliceId);

    if (draggedIndex === -1 || dropIndex === -1) return;

    const newSlices = [...slices];
    const [removed] = newSlices.splice(draggedIndex, 1);
    
    // Adjust drop index if dragging from before to after
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newSlices.splice(adjustedDropIndex, 0, removed);

    onSlicesReorder(newSlices);
    setDraggedSliceId(null);
    setDragOverSliceId(null);
  };

  const handleDragEnd = () => {
    setDraggedSliceId(null);
    setDragOverSliceId(null);
  };

  const getSlicePosition = (index: number) => {
    const totalDuration = slices.reduce((acc, s) => acc + s.duration, 0);
    const startPos = slices.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
    const startPercent = (startPos / totalDuration) * 100;
    const widthPercent = (slices[index].duration / totalDuration) * 100;
    return { left: `${startPercent}%`, width: `${widthPercent}%` };
  };

  return (
    <div className="w-full bg-card rounded-md p-4 border border-card-border">
      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-80 rounded"
          style={{ display: 'block' }}
          data-testid="canvas-waveform"
        />
        
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            {slices.map((slice, index) => {
              const pos = getSlicePosition(index);
              const isSelected = selectedSliceId === slice.id;
              const isDragging = draggedSliceId === slice.id;
              const isDragOver = dragOverSliceId === slice.id;
              
              return (
                <div
                  key={slice.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, slice.id)}
                  onDragOver={(e) => handleDragOver(e, slice.id)}
                  onDrop={(e) => handleDrop(e, slice.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectSlice(slice.id)}
                  className={`
                    absolute top-0 h-full border-2 cursor-move
                    transition-all duration-150
                    ${isSelected ? 'border-chart-3 bg-chart-3/10' : 'border-accent/40 bg-accent/5'}
                    ${isDragging ? 'opacity-40' : ''}
                    ${isDragOver && !isDragging ? 'border-primary bg-primary/10' : ''}
                    hover:bg-accent/15
                  `}
                  style={pos}
                  data-testid={`slice-overlay-${slice.sliceNumber}`}
                >
                  <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-mono px-2 py-0.5 rounded z-10">
                    #{slice.sliceNumber}
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <GripVertical className="h-8 w-8 text-foreground" />
                  </div>

                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 hover:opacity-100 transition-opacity z-10">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-primary hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSliceDuplicate(slice.id);
                      }}
                      data-testid={`button-duplicate-slice-${slice.sliceNumber}`}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSliceDelete(slice.id);
                      }}
                      data-testid={`button-delete-slice-${slice.sliceNumber}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="absolute bottom-2 left-2 text-xs text-muted-foreground font-mono">
                    {slice.duration.toFixed(3)}s
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
