'use client';
/**
 * ARSimulation — Augmented Reality experience using Google Model Viewer.
 *
 * Features:
 * - Real AR on mobile devices (ARCore / ARKit via WebXR & Scene Viewer)
 * - Interactive 3D preview with orbit on desktop
 * - Fallback simulated AR overlay for unsupported devices
 * - Uses the actual car GLB models
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY } from '@/data/cars';

// Dynamically import model-viewer to avoid SSR issues
function useModelViewer() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    import('@google/model-viewer').then(() => setLoaded(true)).catch(() => setLoaded(false));
  }, []);
  return loaded;
}

export default function ARSimulation() {
  const { selectedCarId, selectedColor, setPhase } = useConfiguratorStore();
  const modelViewerLoaded = useModelViewer();
  const scanRef = useRef<HTMLDivElement>(null);
  const [arSupported, setArSupported] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const car = selectedCarId ? CAR_REGISTRY[selectedCarId] : null;
  const bodyColor = selectedColor || car?.defaultColor || '#888';
  const modelSrc = car?.modelPath || '/models/911.glb';

  // Check AR support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      (navigator as Navigator & { xr: { isSessionSupported: (mode: string) => Promise<boolean> } })
        .xr.isSessionSupported('immersive-ar')
        .then((supported) => {
          setArSupported(supported);
          if (!supported) setShowFallback(true);
        })
        .catch(() => setShowFallback(true));
    } else {
      setShowFallback(true);
    }
  }, []);

  // Animate scan line for fallback
  useEffect(() => {
    if (!showFallback) return;
    const el = scanRef.current;
    if (!el) return;
    let frame: number;
    let pos = 0;
    const animate = () => {
      pos = (pos + 0.4) % 100;
      el.style.top = `${pos}%`;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [showFallback]);

  const handleActivateAR = useCallback(() => {
    const mv = document.querySelector('model-viewer');
    if (mv) {
      (mv as HTMLElement & { activateAR: () => void }).activateAR();
    }
  }, []);

  return (
    <motion.div
      className="absolute inset-0 bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      {/* Model Viewer — real 3D + AR */}
      {modelViewerLoaded ? (
        <div className="absolute inset-0">
          {/* @ts-expect-error model-viewer is a web component */}
          <model-viewer
            src={modelSrc}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="auto"
            camera-controls
            touch-action="pan-y"
            auto-rotate
            auto-rotate-delay="0"
            rotation-per-second="30deg"
            camera-orbit="45deg 65deg 6m"
            min-camera-orbit="auto auto 3m"
            max-camera-orbit="auto auto 12m"
            field-of-view="50deg"
            environment-image="neutral"
            shadow-intensity="1.5"
            shadow-softness="0.8"
            exposure="1.0"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#0A0A0A',
              '--poster-color': '#0A0A0A',
            } as React.CSSProperties}
          >
            {/* AR prompt for mobile users */}
            <button
              slot="ar-button"
              className="absolute bottom-32 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-p-gold/90 text-black font-bold text-sm tracking-wider uppercase hover:bg-p-gold transition-colors shadow-lg"
            >
              View in Your Space
            </button>
          {/* @ts-expect-error model-viewer closing tag */}
          </model-viewer>
        </div>
      ) : showFallback ? (
        /* Fallback: Simulated AR for unsupported devices or while loading */
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 70%, #1C1C10 0%, #0A0A08 40%, #000 100%)',
            }}
          />

          {/* Ground grid */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2"
            style={{
              background:
                `repeating-linear-gradient(0deg, rgba(201,168,76,0.06) 0px, rgba(201,168,76,0.06) 1px, transparent 1px, transparent 40px),
                 repeating-linear-gradient(90deg, rgba(201,168,76,0.06) 0px, rgba(201,168,76,0.06) 1px, transparent 1px, transparent 40px)`,
              perspective: '400px',
              transform: 'rotateX(60deg)',
              transformOrigin: 'bottom',
            }}
          />

          {/* Scan line */}
          <div
            ref={scanRef}
            className="absolute left-0 right-0 h-px opacity-60 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.8), transparent)',
            }}
          />

          {/* Car silhouette */}
          <div className="absolute inset-0 flex items-center justify-center pb-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] } }}
            >
              <div className="relative" style={{ width: 480, height: 180 }}>
                <div
                  className="absolute rounded-sm"
                  style={{
                    left: 40, bottom: 50,
                    width: 400, height: 80,
                    backgroundColor: bodyColor,
                    opacity: 0.85,
                    boxShadow: `0 0 40px ${bodyColor}40`,
                  }}
                />
                <div
                  className="absolute rounded-sm"
                  style={{
                    left: 140, bottom: 110,
                    width: 200, height: 60,
                    backgroundColor: bodyColor,
                    opacity: 0.75,
                  }}
                />
                {[80, 340].map((x, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: x, bottom: 24,
                      width: 60, height: 60,
                      backgroundColor: '#1A1A1A',
                      border: '3px solid #3A3A3A',
                    }}
                  />
                ))}
                <div
                  className="absolute"
                  style={{
                    left: 40, bottom: 20,
                    width: 400, height: 16,
                    background: 'radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 70%)',
                    filter: 'blur(8px)',
                  }}
                />
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        /* Loading state */
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="w-8 h-8 rounded-full border-2 border-p-gold border-t-transparent mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="label-caps text-p-muted">Loading AR Experience...</p>
          </div>
        </div>
      )}

      {/* AR UI chrome — corner brackets */}
      {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} w-8 h-8 pointer-events-none`}
          style={{
            borderTop:    (i < 2) ? '2px solid rgba(201,168,76,0.7)' : 'none',
            borderBottom: (i >= 2) ? '2px solid rgba(201,168,76,0.7)' : 'none',
            borderLeft:   (i % 2 === 0) ? '2px solid rgba(201,168,76,0.7)' : 'none',
            borderRight:  (i % 2 === 1) ? '2px solid rgba(201,168,76,0.7)' : 'none',
          }}
        />
      ))}

      {/* Top status bar */}
      <div className="relative z-10 px-8 pt-6 flex items-center justify-between pointer-events-auto">
        <button
          onClick={() => setPhase('performance')}
          className="label-caps text-p-muted hover:text-p-text transition-colors"
        >
          ← Exit AR
        </button>

        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-p-gold"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="label-caps text-p-gold">
            {arSupported ? 'AR Ready' : modelViewerLoaded ? '3D Preview' : 'AR Simulation'}
          </span>
        </div>

        <button
          onClick={() => setPhase('summary')}
          className="label-caps text-p-muted hover:text-p-text transition-colors"
        >
          Summary →
        </button>
      </div>

      {/* Bottom info + AR launch */}
      <div className="relative z-10 mt-auto px-8 pb-8 flex flex-col items-center gap-3 pointer-events-auto">
        {car && (
          <>
            <p className="label-caps text-p-muted">{car.fullName}</p>
            {arSupported && (
              <button
                onClick={handleActivateAR}
                className="px-6 py-2 rounded-full bg-p-gold/20 border border-p-gold/40 text-p-gold label-caps hover:bg-p-gold/30 transition-colors"
              >
                Launch AR Experience
              </button>
            )}
            <p className="label-caps" style={{ color: 'rgba(201,168,76,0.8)', fontSize: '10px' }}>
              {arSupported
                ? 'Tap "View in Your Space" or use AR button below'
                : modelViewerLoaded
                  ? 'Drag to rotate · Pinch to zoom · Real AR on mobile devices'
                  : 'AR visualization · Surface detection simulated'
              }
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
