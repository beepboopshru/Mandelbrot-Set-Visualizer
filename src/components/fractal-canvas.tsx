"use client";

import { useRef, useEffect, useCallback } from 'react';
import { shouldRefine } from '@/ai/flows/progressive-rendering';
import { palettes, type PaletteName } from '@/lib/colors';

interface FractalCanvasProps {
  iterations: number;
  paletteName: PaletteName;
  resetTrigger: number;
  onZoomChange: (zoom: number) => void;
}

const LOW_RES_PIXEL_SIZE = 4;
const DEBOUNCE_DELAY = 300;

export function FractalCanvas({ iterations, paletteName, resetTrigger, onZoomChange }: FractalCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const zoom = useRef(1.0);
    const center = useRef([-0.7, 0]);
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

    const renderMandelbrot = useCallback((isLowRes: boolean = false) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const { width, height } = canvas;
        const palette = palettes[paletteName];
        const pixelSize = isLowRes ? LOW_RES_PIXEL_SIZE : 1;
        
        for (let x = 0; x < width; x += pixelSize) {
            for (let y = 0; y < height; y += pixelSize) {
                let a = center.current[0] + (x - width / 2) / (0.5 * zoom.current * width);
                let b = center.current[1] + (y - height / 2) / (0.5 * zoom.current * height);

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
                
                ctx.fillStyle = palette(n, iterations);
                ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        }
    }, [iterations, paletteName]);

    const handleInteractionEnd = useCallback(() => {
        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
        interactionTimeout.current = setTimeout(async () => {
            const { shouldRefine: doRefine } = await shouldRefine({ isInteracting: false });
            if (doRefine && canvasRef.current) {
                renderMandelbrot(false);
            }
        }, DEBOUNCE_DELAY);
    }, [renderMandelbrot]);

    const handleInteractionStart = useCallback(() => {
        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
        renderMandelbrot(true);
    }, [renderMandelbrot]);

    useEffect(() => {
        const resetView = () => {
            zoom.current = 1.0;
            center.current = [-0.7, 0];
            onZoomChange(1.0);
            renderMandelbrot(false);
        };
        if (resetTrigger > 0) {
            resetView();
        }
    }, [resetTrigger, onZoomChange, renderMandelbrot]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        
        const resizeObserver = new ResizeObserver(() => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            renderMandelbrot(false);
        });

        resizeObserver.observe(container);
        
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        renderMandelbrot(false);

        return () => resizeObserver.disconnect();
    }, [renderMandelbrot]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = (e: MouseEvent) => {
            isDragging.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
            handleInteractionStart();
        };

        const handleMouseUp = () => {
            if (isDragging.current) {
                isDragging.current = false;
                canvas.style.cursor = 'grab';
                handleInteractionEnd();
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            center.current[0] -= dx / (0.5 * zoom.current * canvas.width);
            center.current[1] -= dy / (0.5 * zoom.current * canvas.height);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            renderMandelbrot(true);
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            handleInteractionStart();
            const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;

            const worldX = center.current[0] + (mouseX - canvas.width / 2) / (0.5 * zoom.current * canvas.width);
            const worldY = center.current[1] + (mouseY - canvas.height / 2) / (0.5 * zoom.current * canvas.height);

            zoom.current *= scaleFactor;
            onZoomChange(zoom.current);

            const newWorldX = center.current[0] + (mouseX - canvas.width / 2) / (0.5 * zoom.current * canvas.width);
            const newWorldY = center.current[1] + (mouseY - canvas.height / 2) / (0.5 * zoom.current * canvas.height);

            center.current[0] += worldX - newWorldX;
            center.current[1] += worldY - newWorldY;
            
            renderMandelbrot(true);
            handleInteractionEnd();
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp); // Stop dragging if mouse leaves
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('wheel', handleWheel);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [handleInteractionStart, handleInteractionEnd, onZoomChange, renderMandelbrot]);
    
    return (
        <div ref={containerRef} className="w-full h-full bg-black">
            <canvas ref={canvasRef} className="w-full h-full" style={{cursor: 'grab'}}/>
        </div>
    );
}
