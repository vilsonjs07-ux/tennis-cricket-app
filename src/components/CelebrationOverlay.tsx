import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export type CelebrationType = 'four' | 'six' | 'wicket' | 'victory' | null;

interface CelebrationOverlayProps {
  type: CelebrationType;
  onComplete: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ type, onComplete }) => {
  useEffect(() => {
    if (!type) return;

    let intervalId: any = null;

    if (type === 'six') {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#FDE68A', '#FFFFFF'],
      });
    } else if (type === 'four') {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10B981', '#34D399', '#A7F3D0', '#FFFFFF'],
      });
    } else if (type === 'victory') {
      const end = Date.now() + 2000;
      intervalId = setInterval(() => {
        if (Date.now() > end) {
          if (intervalId) clearInterval(intervalId);
          return;
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#10B981', '#F59E0B', '#38BDF8', '#8B5CF6'],
        });
      }, 250);
    }

    const timer = setTimeout(() => {
      onComplete();
    }, 1400);

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [type]);

  if (!type) return null;

  let title = '';
  let subtitle = '';
  let bgGrad = '';
  let textColor = '';

  if (type === 'six') {
    title = 'MAXIMUM! 6';
    subtitle = 'OUT OF THE GULLY!';
    bgGrad = 'linear-gradient(135deg, rgba(217, 119, 6, 0.95), rgba(245, 158, 11, 0.95))';
    textColor = '#FFFBEB';
  } else if (type === 'four') {
    title = 'FOUR! 4';
    subtitle = 'CRACKING SHOT TO THE WALL!';
    bgGrad = 'linear-gradient(135deg, rgba(5, 150, 105, 0.95), rgba(16, 185, 129, 0.95))';
    textColor = '#ECFDF5';
  } else if (type === 'wicket') {
    title = 'WICKET! ⚡';
    subtitle = 'TIMBER! GONE!';
    bgGrad = 'linear-gradient(135deg, rgba(185, 28, 28, 0.95), rgba(239, 68, 68, 0.95))';
    textColor = '#FEF2F2';
  } else if (type === 'victory') {
    title = 'CHAMPIONS! 🏆';
    subtitle = 'WHAT A MATCH!';
    bgGrad = 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(245, 158, 11, 0.95))';
    textColor = '#FFFFFF';
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        pointerEvents: 'none',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        style={{
          background: bgGrad,
          padding: '20px 36px',
          borderRadius: 24,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7)',
          textAlign: 'center',
          transform: 'scale(1)',
          animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 900,
            color: textColor,
            letterSpacing: '0.5px',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-main)',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.9)',
            letterSpacing: '1px',
            marginTop: 4,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};
