import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  progress: number; // 0 to 1
  audioElement: HTMLAudioElement | null;
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  progress,
  audioElement,
  height = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Set up AudioContext Analyser if user interacts and audioElement is provided
  useEffect(() => {
    if (!audioElement) return;

    // Connect analyser safely
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }

      if (audioCtxRef.current && !sourceNodeRef.current) {
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;

        try {
          const source = audioCtxRef.current.createMediaElementSource(audioElement);
          source.connect(analyser);
          analyser.connect(audioCtxRef.current.destination);
          analyserRef.current = analyser;
          sourceNodeRef.current = source;
        } catch {
          // If media element already connected, ignore
        }
      }
    } catch {
      // Fallback to simulated wave if Web Audio is restricted
    }
  }, [audioElement]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      // Number of bars
      const barCount = 64;
      const barWidth = width / barCount - 2;

      let frequencyData: Uint8Array | null = null;
      if (analyserRef.current && isPlaying) {
        const binCount = analyserRef.current.frequencyBinCount;
        const arrayBuffer = new ArrayBuffer(binCount);
        const dataArray = new Uint8Array(arrayBuffer);
        analyserRef.current.getByteFrequencyData(dataArray);
        frequencyData = dataArray;
      }

      // Background subtle guide line
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        let barHeight = 8;

        if (isPlaying) {
          if (frequencyData && frequencyData.length > 0) {
            const dataIndex = Math.floor((i / barCount) * (frequencyData.length * 0.7));
            const val = frequencyData[dataIndex] || 0;
            barHeight = Math.max(6, (val / 255) * (h * 0.85));
          } else {
            // Smooth natural animated wave pattern
            const wave1 = Math.sin(phase + i * 0.2) * 0.5 + 0.5;
            const wave2 = Math.cos(phase * 1.5 + i * 0.15) * 0.5 + 0.5;
            const centerFactor = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
            barHeight = 6 + (wave1 * 0.6 + wave2 * 0.4) * (h * 0.75) * (0.3 + centerFactor * 0.7);
          }
        } else {
          // Resting waveform profile
          const centerFactor = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
          const staticCurve = Math.sin((i / barCount) * Math.PI) * 0.7 + 0.3;
          barHeight = 4 + staticCurve * 20 * centerFactor;
        }

        const y = (h - barHeight) / 2;
        const currentProgressX = progress * width;
        const isPastProgress = x <= currentProgressX;

        // Gradient based on whether playback has reached this point
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPastProgress) {
          grad.addColorStop(0, '#10b981'); // emerald-500
          grad.addColorStop(0.5, '#06b6d4'); // cyan-500
          grad.addColorStop(1, '#6366f1'); // indigo-500
        } else {
          grad.addColorStop(0, 'rgba(71, 85, 105, 0.6)');
          grad.addColorStop(1, 'rgba(51, 65, 85, 0.3)');
        }

        ctx.fillStyle = grad;
        // Rounded bar
        const radius = Math.min(barWidth / 2, 2);
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      phase += 0.08;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, progress]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-slate-950/70 border border-slate-800/80 p-2 shadow-inner">
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
