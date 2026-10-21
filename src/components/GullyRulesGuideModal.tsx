import React from 'react';
import { X, BookOpen, ShieldCheck, CheckCircle2, Ban } from 'lucide-react';

interface TennisRulesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GullyRulesGuideModal: React.FC<TennisRulesGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rulesList = [
    {
      title: '🚫 NO LBW (Leg Before Wicket)',
      badge: 'Core Tennis Cricket Law',
      badgeColor: '#EF4444',
      desc: 'In Tennis Ball Cricket tournaments, Leg Before Wicket (LBW) is strictly NOT applicable. If the ball hits the batter’s pad or body in line with stumps, it is NOT OUT.',
    },
    {
      title: '🎯 Standard Official Dismissals',
      badge: 'Official ICC Law',
      badgeColor: '#10B981',
      desc: 'All standard dismissals apply: Clean Bowled, Caught (deep/inner ring), Caught Behind by wicketkeeper, Caught & Bowled, Stumped by keeper, Run Out (direct hit or broken stumps), and Hit Wicket.',
    },
    {
      title: '🚨 No-Ball & Free Hit',
      badge: 'White-Ball Law',
      badgeColor: '#F59E0B',
      desc: 'Overstepping front-foot or above-waist full toss incurs 1 penalty run, requires a re-ball, and awards a FREE HIT on the subsequent legal delivery. Batter cannot be dismissed except run out.',
    },
    {
      title: '↔️ Wide Ball & Tramlines',
      badge: 'Official Law',
      badgeColor: '#38BDF8',
      desc: 'Deliveries straying outside the off-side or leg-side tramlines incur 1 extra run and must be re-bowled.',
    },
    {
      title: '🏃 Byes & Leg Byes Permitted',
      badge: 'Official Law',
      badgeColor: '#8B5CF6',
      desc: 'Batters may steal runs if the ball beats the keeper (Byes) or deflects off the pads (Leg Byes). These runs are credited to team extras and not charged to the bowler.',
    },
    {
      title: '🔄 Alternating Bowlers',
      badge: 'Official Law',
      badgeColor: '#10B981',
      desc: 'Bowlers must alternate overs. A bowler cannot bowl two consecutive overs from either end.',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
                Tennis Ball Cricket Rules
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Official Tournament Laws • No LBW
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Highlight Banner */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Ban size={20} color="#EF4444" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.78rem', color: '#FCA5A5' }}>
            <strong>Official Tennis Cricket Regulation:</strong> All standard cricket rules are strictly enforced, with the sole exception that <strong>LBW is excluded</strong>.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rulesList.map((rule, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>{rule.title}</h4>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: `${rule.badgeColor}20`,
                    color: rule.badgeColor,
                    border: `1px solid ${rule.badgeColor}40`,
                    textTransform: 'uppercase',
                  }}
                >
                  {rule.badge}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{rule.desc}</p>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="btn-primary" style={{ marginTop: 18 }}>
          Understood, Let's Play!
        </button>
      </div>
    </div>
  );
};
