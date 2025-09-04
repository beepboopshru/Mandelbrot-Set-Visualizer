export type PaletteFunction = (n: number, maxIterations: number) => string;
export type PaletteName = 'neon' | 'psychedelic' | 'grayscale' | 'fire';

const neonPalette: PaletteFunction = (n, maxIterations) => {
    if (n === maxIterations) return '#000000';
    const t = n / maxIterations;

    const c1 = [13, 5, 25];
    const c2 = [208, 99, 255];
    const c3 = [99, 181, 255];
    const c4 = [230, 245, 255];

    let r, g, b;

    if (t < 0.2) {
        const localT = t / 0.2;
        r = c1[0] + (c2[0] - c1[0]) * localT;
        g = c1[1] + (c2[1] - c1[1]) * localT;
        b = c1[2] + (c2[2] - c1[2]) * localT;
    } else if (t < 0.6) {
        const localT = (t - 0.2) / 0.4;
        r = c2[0] + (c3[0] - c2[0]) * localT;
        g = c2[1] + (c3[1] - c2[1]) * localT;
        b = c2[2] + (c3[2] - c2[2]) * localT;
    } else {
        const localT = (t - 0.6) / 0.4;
        r = c3[0] + (c4[0] - c3[0]) * localT;
        g = c3[1] + (c4[1] - c3[1]) * localT;
        b = c3[2] + (c4[2] - c3[2]) * localT;
    }
    
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
};

const psychedelicPalette: PaletteFunction = (n, maxIterations) => {
  if (n === maxIterations) return '#000000';
  const hue = Math.floor(360 * n / maxIterations);
  const saturation = 90;
  const lightness = 50;

  let r, g, b;
  let s = saturation / 100;
  let l = lightness / 100;
  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((hue / 60) % 2 - 1)),
      m = l - c/2;
  
  if (0 <= hue && hue < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= hue && hue < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= hue && hue < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= hue && hue < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= hue && hue < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const grayscalePalette: PaletteFunction = (n, maxIterations) => {
  if (n === maxIterations) return '#000000';
  const value = Math.floor(255 * n / maxIterations);
  const hex = value.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
};

const firePalette: PaletteFunction = (n, maxIterations) => {
    if (n === maxIterations) return '#000000';
    const t = n / maxIterations;
    const r = Math.floor(255 * Math.pow(t, 0.5));
    const g = Math.floor(255 * Math.pow(t, 2));
    const b = Math.floor(255 * Math.pow(t, 8));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const palettes: { [key in PaletteName]: PaletteFunction } = {
  'neon': neonPalette,
  'psychedelic': psychedelicPalette,
  'fire': firePalette,
  'grayscale': grayscalePalette,
};
