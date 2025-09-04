"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { palettes, type PaletteName } from "@/lib/colors";

interface ControlPanelProps {
  iterations: number;
  setIterations: (value: number) => void;
  palette: PaletteName;
  setPalette: (value: PaletteName) => void;
  zoom: number;
}

export function ControlPanel({
  iterations,
  setIterations,
  palette,
  setPalette,
  zoom,
}: ControlPanelProps) {
  const paletteNames = Object.keys(palettes) as PaletteName[];

  return (
    <Card className="h-full bg-card/80 backdrop-blur-sm border-0 md:border">
      <CardHeader>
        <CardTitle className="font-headline text-accent">Controls</CardTitle>
        <CardDescription>Adjust the fractal visualization.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="iterations">Iterations</Label>
            <span className="text-sm text-muted-foreground">{iterations}</span>
          </div>
          <Slider
            id="iterations"
            min={50}
            max={2000}
            step={10}
            value={[iterations]}
            onValueChange={(value) => setIterations(value[0])}
          />
        </div>
        <div className="space-y-4">
          <Label htmlFor="palette">Color Palette</Label>
          <Select value={palette} onValueChange={(value: PaletteName) => setPalette(value)}>
            <SelectTrigger id="palette">
              <SelectValue placeholder="Select a palette" />
            </SelectTrigger>
            <SelectContent>
              {paletteNames.map((name) => (
                <SelectItem key={name} value={name} className="capitalize">
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
            <Label>Zoom Level</Label>
            <p className="text-lg font-mono text-primary">{zoom.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x</p>
        </div>
      </CardContent>
    </Card>
  );
}
