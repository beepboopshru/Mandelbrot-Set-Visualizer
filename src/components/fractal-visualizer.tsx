"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { ControlPanel } from "@/components/control-panel";
import { FractalCanvas } from "@/components/fractal-canvas";
import type { PaletteName } from "@/lib/colors";
import { ScrollArea } from "./ui/scroll-area";

export function FractalVisualizer() {
  const [iterations, setIterations] = useState(100);
  const [palette, setPalette] = useState<PaletteName>('neon');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [zoom, setZoom] = useState(1.0);

  const handleReset = () => {
    setIterations(100);
    setPalette('neon');
    setZoom(1.0);
    setResetTrigger(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header onReset={handleReset} />
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div className="flex-1 relative order-2 md:order-1">
          <FractalCanvas
            iterations={iterations}
            paletteName={palette}
            resetTrigger={resetTrigger}
            onZoomChange={setZoom}
          />
        </div>
        <aside className="w-full md:w-80 h-auto md:h-full order-1 md:order-2 shrink-0 border-t md:border-l md:border-t-0">
          <ScrollArea className="h-full w-full p-4">
            <ControlPanel
              iterations={iterations}
              setIterations={setIterations}
              palette={palette}
              setPalette={setPalette}
              zoom={zoom}
            />
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
