'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils'; // Assuming this exists, based on other UI components

interface GlobeProps {
    className?: string;
}

export function Globe({ className }: GlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;
        let frameId: number;

        const GLOBE_RADIUS = 200;
        const DOT_RADIUS = 2;
        const DOT_COUNT = 300; // Number of dots


        // Fibonacci sphere distribution
        const dots: { x: number; y: number; z: number; theta: number; phi: number }[] = [];
        const goldenRatio = (1 + Math.sqrt(5)) / 2;

        for (let i = 0; i < DOT_COUNT; i++) {
            const theta = 2 * Math.PI * i / goldenRatio;
            const phi = Math.acos(1 - 2 * (i + 0.5) / DOT_COUNT);

            const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
            const y = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
            const z = GLOBE_RADIUS * Math.cos(phi);

            dots.push({ x, y, z, theta, phi });
        }

        let rotationX = 0;
        let rotationY = 0;

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Rotate globe
            rotationY += 0.003;
            rotationX += 0.001;

            const cx = width / 2;
            const cy = height / 2;

            dots.forEach(dot => {
                // Rotate around Y axis
                const x = dot.x * Math.cos(rotationY) - dot.z * Math.sin(rotationY);
                let z = dot.z * Math.cos(rotationY) + dot.x * Math.sin(rotationY);

                // Rotate around X axis
                const y = dot.y * Math.cos(rotationX) - z * Math.sin(rotationX);
                z = z * Math.cos(rotationX) + dot.y * Math.sin(rotationX);

                // Perspective projection
                const scale = 400 / (400 - z);
                const x2d = x * scale + cx;
                const y2d = y * scale + cy;

                // Draw only if in front
                if (z < 100) { // Simple z-culling/fading
                    const alpha = Math.max(0.1, (150 - z) / 250); // Fade out back dots
                    ctx.beginPath();
                    ctx.arc(x2d, y2d, DOT_RADIUS * scale, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(100, 116, 255, ${alpha})`; // Hardcoded color for now, could be dynamic
                    ctx.fill();
                }
            });

            frameId = requestAnimationFrame(render);
        };

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };

        window.addEventListener('resize', handleResize);
        render();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={cn("w-full h-full", className)}
            style={{ width: '100%', height: '100%' }}
        />
    );
}
