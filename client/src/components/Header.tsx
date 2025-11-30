import { Music } from "lucide-react";

export default function Header() {
  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card flex items-center px-3 sm:px-6 gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <Music className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
        </div>
        <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
          Beat Slicer
        </h1>
      </div>
      <div className="ml-auto text-xs sm:text-sm text-muted-foreground font-mono whitespace-nowrap">
        v1.0
      </div>
    </header>
  );
}
