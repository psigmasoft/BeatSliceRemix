import { Upload, FileAudio } from "lucide-react";
import { useState } from "react";

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function AudioUploader({ onFileSelect }: AudioUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('audio/') || file.name.match(/\.(wav|mp3|ogg|aiff)$/i))) {
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex items-center justify-center py-16">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full max-w-2xl h-52 rounded-md border-2 border-dashed
          transition-colors duration-200 hover-elevate
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-border'}
        `}
      >
        <input
          type="file"
          accept="audio/*,.wav,.mp3,.ogg,.aiff"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          data-testid="input-audio-file"
        />
        <div className="flex flex-col items-center justify-center h-full gap-4 pointer-events-none">
          {isDragOver ? (
            <FileAudio className="h-12 w-12 text-primary" />
          ) : (
            <Upload className="h-12 w-12 text-muted-foreground" />
          )}
          <div className="text-center">
            <p className="text-base font-medium text-foreground mb-1">
              Drop your audio file here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            .wav, .mp3, .aiff, .ogg
          </div>
        </div>
      </div>
    </div>
  );
}
