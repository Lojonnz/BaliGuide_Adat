import { useState, useRef, useEffect } from 'react';
import { RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { wianjanaLetters } from '../../data';

export function WritingPractice() {
  const { t } = useI18n();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const currentLetter = wianjanaLetters[selectedIndex];

  // Safeguard #3: High-DPI canvas scaling — dynamically scale using
  // devicePixelRatio so Retina/4K screens don't render blurry.
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set canvas pixel dimensions to match device resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale context so CSS pixels map to device pixels 1:1
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;

    contextRef.current = ctx;
    return ctx;
  };

  // Initialize canvas
  useEffect(() => {
    const ctx = setupCanvas();
    if (!ctx) return;

    // Draw guide path
    drawGuidePath(ctx, currentLetter.strokes);

    // Re-setup on resize / orientation change / dpr change
    const handleResize = () => {
      const newCtx = setupCanvas();
      if (newCtx) drawGuidePath(newCtx, currentLetter.strokes);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [currentLetter]);

  const drawGuidePath = (ctx: CanvasRenderingContext2D, _pathData: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();

    // Clear canvas (in CSS pixel space — context is already DPR-scaled)
    ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);

    // Parse and draw SVG path as guide (simplified - draws it in light gray)
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.2)'; // Faint terracotta
    ctx.lineWidth = 6;

    // Simple path rendering (this is a mock - real SVG path parsing is complex)
    // For demo purposes, just draw the guide as styled text
    ctx.font = 'bold 120px serif';
    ctx.fillStyle = 'rgba(180, 83, 9, 0.15)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentLetter.aksara, canvasRect.width / 2, canvasRect.height / 2);
  };

  const startDrawing = (x: number, y: number) => {
    if (!contextRef.current || !canvasRef.current) return;

    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = contextRef.current;

    ctx.strokeStyle = 'var(--color-terracotta)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - rect.left, y - rect.top);
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = contextRef.current;

    ctx.lineTo(x - rect.left, y - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Calculate mock score (random 60-95%)
    const mockScore = Math.floor(Math.random() * 36) + 60;
    setScore(mockScore);

    if (mockScore > 80) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    startDrawing(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    draw(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    stopDrawing();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrawing(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    draw(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const clearCanvas = () => {
    const ctx = contextRef.current;
    if (!ctx || !canvasRef.current) return;

    setScore(null);
    drawGuidePath(ctx, currentLetter.strokes);
  };

  const nextLetter = () => {
    setSelectedIndex((prev) => (prev + 1) % wianjanaLetters.length);
    setScore(null);
    clearCanvas();
  };

  const handleLetterSelect = (index: number) => {
    setSelectedIndex(index);
    setScore(null);
    setTimeout(() => clearCanvas(), 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--color-text)',
        margin: 0
      }}>
        {t('Writing Practice', 'Latihan Menulis')}
      </h3>

      {/* Letter selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: 'var(--color-text)'
        }}>
          {t('Select Letter', 'Pilih Huruf')}
        </label>
        <select
          value={selectedIndex}
          onChange={(e) => handleLetterSelect(Number(e.target.value))}
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            fontSize: '1rem',
            color: 'var(--color-text)',
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          {wianjanaLetters.map((letter, idx) => (
            <option key={idx} value={idx}>
              {letter.aksara} — {letter.latin}
            </option>
          ))}
        </select>
      </div>

      {/* Letter display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius)',
        position: 'relative',
      }}>
        <div style={{
          fontSize: '6rem',
          color: 'var(--color-terracotta)',
          fontWeight: 'bold',
        }}>
          {currentLetter.aksara}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          fontSize: '1.25rem',
          color: 'var(--color-text-muted)',
          fontFamily: 'monospace',
        }}>
          {currentLetter.latin}
        </div>
      </div>

      {/* Canvas area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: 'var(--color-text)'
        }}>
          {t('Trace the letter', 'Jiplak hurufnya')}
        </label>
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              width: '100%',
              height: '300px',
              backgroundColor: 'var(--color-bg)',
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius)',
              cursor: 'crosshair',
              touchAction: 'none',
            }}
          />

          {/* Confetti animation */}
          {showConfetti && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '4rem',
              animation: 'bounce 0.6s ease-in-out',
              pointerEvents: 'none',
            }}>
              <Sparkles size={64} color="var(--color-amber)" fill="var(--color-amber)" />
            </div>
          )}
        </div>
      </div>

      {/* Score display */}
      {score !== null && (
        <div style={{
          padding: '1rem',
          backgroundColor: score > 80 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `2px solid ${score > 80 ? 'rgb(34, 197, 94)' : 'rgb(245, 158, 11)'}`,
          borderRadius: 'var(--radius)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            marginBottom: '0.25rem'
          }}>
            {t('Score', 'Skor')}
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--color-text)'
          }}>
            {score}%
          </div>
          {score > 80 && (
            <div style={{
              fontSize: '0.875rem',
              color: 'rgb(34, 197, 94)',
              marginTop: '0.25rem',
              fontWeight: '500'
            }}>
              {t('Excellent!', 'Sangat Baik!')}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={clearCanvas}
          style={{
            flex: '1',
            minWidth: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--color-text)',
            minHeight: '44px',
          }}
        >
          <RotateCcw size={16} />
          {t('Clear Canvas', 'Hapus Kanvas')}
        </button>

        <button
          onClick={nextLetter}
          style={{
            flex: '1',
            minWidth: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            minHeight: '44px',
          }}
        >
          <SkipForward size={16} />
          {t('Next Letter', 'Huruf Berikutnya')}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
