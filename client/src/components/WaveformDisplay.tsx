import { useEffect, useRef } from "react";

interface WaveformDisplayProps {
  audioBuffer: AudioBuffer | null;
  slicePoints: number[];
  currentTime: number;
  duration: number;
}

export default function WaveformDisplay({
  audioBuffer,
  slicePoints,
  currentTime,
  duration,
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    slicePoints.forEach((point) => {
      const x = (point / duration) * width;
      ctx.strokeStyle = 'hsl(280, 60%, 65%)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
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
  }, [audioBuffer, slicePoints, currentTime, duration]);

  return (
    <div className="w-full bg-card rounded-md p-4 border border-card-border">
      <canvas
        ref={canvasRef}
        className="w-full h-80 rounded"
        style={{ display: 'block' }}
        data-testid="canvas-waveform"
      />
    </div>
  );
}
