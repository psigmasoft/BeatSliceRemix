import { Music } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
          <Music className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Beat Slicer</h1>
      </div>
      <div className="ml-auto text-sm text-muted-foreground font-mono">
        v1.0
      </div>
    </header>
  );
}
