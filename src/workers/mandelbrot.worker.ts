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
        imageData
    } = e.data;

    const palette = palettes[paletteName as PaletteName];
    const data = imageData.data;

    for (let y = yStart; y < yEnd; y++) {
        for (let x = 0; x < width; x++) {
            let a = center[0] + (x - width / 2) / (0.5 * zoom * width);
            let b = center[1] + (y - height / 2) / (0.5 * zoom * height);

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
            const pixelIndex = ((y - yStart) * width + x) * 4;
            
            data[pixelIndex] = r;
            data[pixelIndex + 1] = g;
            data[pixelIndex + 2] = b_;
            data[pixelIndex + 3] = 255;
        }
    }

    postMessage({imageData, yStart}, [imageData.data.buffer]);
};
