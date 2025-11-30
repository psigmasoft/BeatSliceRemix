import { useEffect, useRef, useState } from "react";
import { GripVertical, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEventCoordinates, isTouchEvent, preventTouchScroll } from "@/utils/touchEventUtils";

export interface Slice {
  id: string;
  sliceNumber: number;
  sliceLabel: string;
  colorHue: number;
  duration: number;
  startTime: number;
  endTime: number;
}

interface WaveformDisplayProps {
  audioBuffer: AudioBuffer | null;
  rearrangedBuffer: AudioBuffer | null;
  slices: Slice[];
  currentTime: number;
  duration: number;
  selectedSliceId: string | null;
  onSelectSlice: (id: string | null) => void;
  onSlicesReorder: (slices: Slice[]) => void;
  onSliceDelete: (id: string) => void;
  onSliceDuplicate: (id: string) => void;
  onSliceClick: (slice: Slice) => void;
}

export default function WaveformDisplay({
   audioBuffer,
   rearrangedBuffer,
   slices,
   currentTime,
   duration,
   selectedSliceId,
   onSelectSlice,
   onSlicesReorder,
   onSliceDelete,
   onSliceDuplicate,
   onSliceClick,
 }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedSliceId, setDraggedSliceId] = useState<string | null>(null);
  const [dragOverSliceId, setDragOverSliceId] = useState<string | null>(null);
  const dragStartPointRef = useRef<{ x: number; y: number } | null>(null);
  const draggedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const bufferToRender = rearrangedBuffer || audioBuffer;
    if (!canvas || !bufferToRender) return;

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

    const channelData = bufferToRender.getChannelData(0);
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
  }, [audioBuffer, rearrangedBuffer, slices, currentTime, duration]);

  const handleDragStart = (e: React.DragEvent | React.TouchEvent, element: HTMLElement, sliceId: string) => {
    setDraggedSliceId(sliceId);
    draggedElementRef.current = element;
    
    // Store start coordinates for touch events
    const coordinates = isTouchEvent(e.nativeEvent)
      ? getEventCoordinates(e.nativeEvent as TouchEvent)
      : getEventCoordinates(e.nativeEvent as DragEvent);
    dragStartPointRef.current = { x: coordinates.clientX, y: coordinates.clientY };

    if (e instanceof React.DragEvent) {
      e.dataTransfer.effectAllowed = 'move';
    } else if (isTouchEvent(e.nativeEvent)) {
      // Prevent scroll during touch drag
      preventTouchScroll(e.nativeEvent as TouchEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent | React.TouchEvent, sliceId: string) => {
    if (e instanceof React.DragEvent) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    } else if (isTouchEvent(e.nativeEvent)) {
      e.preventDefault();
    }
    setDragOverSliceId(sliceId);
  };

  const handleDrop = (e: React.DragEvent | React.TouchEvent, dropSliceId: string) => {
    if (e instanceof React.DragEvent) {
      e.preventDefault();
    } else if (isTouchEvent(e.nativeEvent)) {
      e.preventDefault();
    }

    if (!draggedSliceId || draggedSliceId === dropSliceId) {
      setDraggedSliceId(null);
      setDragOverSliceId(null);
      dragStartPointRef.current = null;
      draggedElementRef.current = null;
      return;
    }

    const draggedIndex = slices.findIndex(s => s.id === draggedSliceId);
    const dropIndex = slices.findIndex(s => s.id === dropSliceId);

    if (draggedIndex === -1 || dropIndex === -1) return;

    const newSlices = [...slices];
    const [removed] = newSlices.splice(draggedIndex, 1);

    // Calculate correct insertion position
    // splice(index, 0, element) inserts BEFORE the position
    // For dragging right (left to right): we want to insert after drop target
    // For dragging left (right to left): we want to insert before drop target
    let insertIndex: number;
    if (draggedIndex < dropIndex) {
      // Dragging right: after removing dragged element, insert at dropIndex to place after target
      insertIndex = dropIndex;
    } else {
      // Dragging left: insert at dropIndex to place before target
      insertIndex = dropIndex;
    }
    newSlices.splice(insertIndex, 0, removed);

    onSlicesReorder(newSlices);
    setDraggedSliceId(null);
    setDragOverSliceId(null);
    dragStartPointRef.current = null;
    draggedElementRef.current = null;
  };

  const handleDragEnd = () => {
    setDraggedSliceId(null);
    setDragOverSliceId(null);
    dragStartPointRef.current = null;
    draggedElementRef.current = null;
  };

  const getSlicePosition = (index: number) => {
    const totalDuration = slices.reduce((acc, s) => acc + s.duration, 0);
    const startPos = slices.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
    const startPercent = (startPos / totalDuration) * 100;
    const widthPercent = (slices[index].duration / totalDuration) * 100;
    return { left: `${startPercent}%`, width: `${widthPercent}%` };
  };

  return (
    <div className="w-full bg-card rounded-md p-2 sm:p-4 border border-card-border overflow-x-auto">
      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-48 sm:h-80 rounded"
          style={{ display: 'block', minHeight: '12rem' }}
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
                   onDragStart={(e) => handleDragStart(e, e.currentTarget, slice.id)}
                   onTouchStart={(e) => handleDragStart(e, e.currentTarget, slice.id)}
                   onDragOver={(e) => handleDragOver(e, slice.id)}
                   onTouchMove={(e) => handleDragOver(e, slice.id)}
                   onDrop={(e) => handleDrop(e, slice.id)}
                   onTouchEnd={(e) => handleDrop(e, slice.id)}
                   onDragEnd={handleDragEnd}
                   onClick={() => {
                     onSelectSlice(slice.id);
                     onSliceClick(slice);
                   }}
                   className={`
                     absolute top-0 h-full border-2 cursor-move select-none touch-none
                     transition-all duration-150
                     ${isSelected ? 'border-chart-3 bg-chart-3/10' : 'border-accent/40 bg-accent/5'}
                     ${isDragging ? 'opacity-40' : ''}
                       ${isDragOver && !isDragging ? 'border-primary bg-primary/10' : ''}
                       hover:bg-accent/15 active:opacity-60
                   `}
                   style={pos}
                   data-testid={`slice-overlay-${slice.sliceNumber}`}
                 >
                  <div
                    className="absolute top-2 left-2 text-white text-sm font-bold px-2.5 py-1 rounded z-10 shadow-md"
                    style={{ backgroundColor: `hsl(${slice.colorHue}, 70%, 50%)` }}
                    data-testid={`label-slice-${slice.sliceLabel}`}
                  >
                    {slice.sliceLabel}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <GripVertical className="h-8 w-8 text-foreground" />
                  </div>

                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1 opacity-0 hover:opacity-100 sm:hover:opacity-100 active:opacity-100 transition-opacity z-10">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 sm:h-6 sm:w-6 text-primary hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSliceDuplicate(slice.id);
                      }}
                      data-testid={`button-duplicate-slice-${slice.sliceNumber}`}
                    >
                      <Copy className="h-4 sm:h-3 w-4 sm:w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 sm:h-6 sm:w-6 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSliceDelete(slice.id);
                      }}
                      data-testid={`button-delete-slice-${slice.sliceNumber}`}
                    >
                      <X className="h-5 sm:h-4 w-5 sm:w-4" />
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
