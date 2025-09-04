"use client";

import { AboutDialog } from "@/components/about-dialog";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onReset: () => void;
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b shrink-0 z-20">
      <h1 className="text-2xl font-headline font-bold text-primary tracking-wider">
        Fractal Neon
      </h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onReset}>Reset</Button>
        <AboutDialog />
      </div>
    </header>
  );
}
