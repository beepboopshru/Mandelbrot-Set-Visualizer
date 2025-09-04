export type PaletteFunction = (n: number, maxIterations: number) => string;
export type PaletteName = 'neon' | 'psychedelic' | 'grayscale' | 'fire';

function lerpColor(a: number[], b: number[], amount: number): number[] {
  const [ar, ag, ab] = a;
  const [br, bg, bb] = b;

  const r = ar + (br - ar) * amount;
  const g = ag + (bg - ag) * amount;
  const b_ = ab + (bb - ab) * amount;

  return [r, g, b_];
}

const neonPalette: PaletteFunction = (n, maxIterations) => {
    if (n === maxIterations) return '#000000';
    const t = n / maxIterations;

    const c1 = [13, 5, 25]; // Dark Purple
    const c2 = [208, 99, 255]; // Electric Purple
    const c3 = [99, 181, 255]; // Bright Blue
    const c4 = [230, 245, 255]; // Whiteish Blue

    if (t < 0.2) {
        const c = lerpColor(c1, c2, t / 0.2);
        return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    } else if (t < 0.6) {
        const c = lerpColor(c2, c3, (t - 0.2) / 0.4);
        return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    } else {
        const c = lerpColor(c3, c4, (t - 0.6) / 0.4);
        return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    }
};

const psychedelicPalette: PaletteFunction = (n, maxIterations) => {
  if (n === maxIterations) return '#000000';
  const hue = Math.floor(360 * n / maxIterations);
  const saturation = 90;
  const lightness = 50;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const grayscalePalette: PaletteFunction = (n, maxIterations) => {
  if (n === maxIterations) return '#000000';
  const value = Math.floor(255 * n / maxIterations);
  return `rgb(${value}, ${value}, ${value})`;
};

const firePalette: PaletteFunction = (n, maxIterations) => {
    if (n === maxIterations) return '#000000';
    const t = n / maxIterations;
    const r = Math.floor(255 * Math.pow(t, 0.5));
    const g = Math.floor(255 * Math.pow(t, 2));
    const b = Math.floor(255 * Math.pow(t, 8));
    return `rgb(${r},${g},${b})`;
};

export const palettes: { [key in PaletteName]: PaletteFunction } = {
  'neon': neonPalette,
  'psychedelic': psychedelicPalette,
  'fire': firePalette,
  'grayscale': grayscalePalette,
};
