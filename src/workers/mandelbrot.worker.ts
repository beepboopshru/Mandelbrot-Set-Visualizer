import { palettes, type PaletteName } from '@/lib/colors';

function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0];
}

onmessage = (e) => {
    const {
        width,
        height,
        yStart,
        yEnd,
        center,
        zoom,
        iterations,
        paletteName,
        pixelSize,
    } = e.data;

    const palette = palettes[paletteName as PaletteName];
    const offscreenCanvas = new OffscreenCanvas(width, yEnd - yStart);
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(width, yEnd - yStart);
    const data = imageData.data;

    for (let y = 0; y < yEnd - yStart; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            let a = center[0] + ((x + x*pixelSize/2) - width / 2) / (0.5 * zoom * width);
            let b = center[1] + ((y+yStart + y*pixelSize/2) - height / 2) / (0.5 * zoom * height);

            const ca = a;
            const cb = b;
            let n = 0;

            while (n < iterations) {
                const aa = a * a - b * b;
                const bb = 2 * a * b;
                a = aa + ca;
                b = bb + cb;
                if (a * a + b * b > 4) break;
                n++;
            }
            
            const colorStr = palette(n, iterations);
            const [r, g, b_] = n === iterations ? [0,0,0] : hexToRgb(colorStr);
            
            for (let py = 0; py < pixelSize; py++) {
                for (let px = 0; px < pixelSize; px++) {
                    if (y + py >= yEnd - yStart || x + px >= width) continue;
                    const pixelIndex = ((y + py) * width + (x + px)) * 4;
                    data[pixelIndex] = r;
                    data[pixelIndex + 1] = g;
                    data[pixelIndex + 2] = b_;
                    data[pixelIndex + 3] = 255;
                }
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    postMessage({imageData, yStart});
};
