"use client";

import { useRef, useEffect, useCallback, useMemo } from 'react';
import type { PaletteName } from '@/lib/colors';

interface FractalCanvasProps {
  iterations: number;
  paletteName: PaletteName;
  resetTrigger: number;
  onZoomChange: (zoom: number) => void;
}

const DEBOUNCE_DELAY = 150;

export function FractalCanvas({ iterations, paletteName, resetTrigger, onZoomChange }: FractalCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const zoom = useRef(1.0);
    const center = useRef([-0.7, 0]);
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

    const numWorkers = useMemo(() => (typeof window !== 'undefined' ? window.navigator.hardwareConcurrency || 2 : 2), []);
    const workers = useMemo<Worker[]>(() => [], []);


    const renderMandelbrot = useCallback((isLowRes: boolean = false) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { width, height } = canvas;
        const pixelSize = isLowRes ? Math.max(2, Math.floor(8 / zoom.current)) : 1;

        if (workers.length === 0) {
            for (let i = 0; i < numWorkers; i++) {
                const worker = new Worker(new URL('../workers/mandelbrot.worker.ts', import.meta.url));
                worker.onmessage = (e) => {
                    const { imageData, yStart } = e.data;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.putImageData(imageData, 0, yStart);
                    }
                };
                workers.push(worker);
            }
        }
        
        const rowsPerWorker = Math.ceil(height / numWorkers);

        for (let i = 0; i < numWorkers; i++) {
            const yStart = i * rowsPerWorker;
            let yEnd = (i + 1) * rowsPerWorker;
            if (yEnd > height) yEnd = height;

            if (yStart >= yEnd) continue;
            
            workers[i].postMessage({
                width,
                height,
                yStart,
                yEnd,
                center: center.current,
                zoom: zoom.current,
                iterations,
                paletteName,
                pixelSize,
            });
        }

    }, [iterations, paletteName, workers, numWorkers]);

    const handleInteractionEnd = useCallback(() => {
        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
        interactionTimeout.current = setTimeout(() => {
            if (canvasRef.current) {
                renderMandelbrot(false);
            }
        }, DEBOUNCE_DELAY);
    }, [renderMandelbrot]);

    const handleInteractionStart = useCallback(() => {
        if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
        renderMandelbrot(true);
    }, [renderMandelbrot]);
    
    useEffect(() => {
        renderMandelbrot(false);
    }, [iterations, paletteName, renderMandelbrot]);

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
        
        return () => {
            resizeObserver.disconnect();
            workers.forEach(w => w.terminate());
            workers.length = 0;
        }

    }, [renderMandelbrot, workers]);

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
        canvas.addEventListener('mouseleave', handleMouseUp);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('wheel', handleWheel);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [handleInteractionStart, handleInteractionEnd, onZoomChange]);
    
    return (
        <div ref={containerRef} className="w-full h-full bg-black">
            <canvas ref={canvasRef} className="w-full h-full" style={{cursor: 'grab'}}/>
        </div>
    );
}
