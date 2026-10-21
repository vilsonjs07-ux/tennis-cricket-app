import React from 'react';
import { DeliveryEvent, InningsState } from '../../types/cricket';

interface OverTimelineProps {
  innings: InningsState;
  ballsPerOver: number;
}

export const OverTimeline: React.FC<OverTimelineProps> = ({ innings, ballsPerOver }) => {
  // Find deliveries in current over
  // A new over starts after legal balls reach ballsPerOver
  const allDeliveries = innings.deliveries;
  
  // Get deliveries since the last completed over
  let currentOverDeliveries: DeliveryEvent[] = [];
  if (allDeliveries.length > 0) {
    const totalLegal = innings.legalDeliveries;
    const legalInThisOver = totalLegal % ballsPerOver;
    
    // Find how many balls to slice from end
    let countLegal = 0;
    let sliceIndex = allDeliveries.length;
    
    for (let i = allDeliveries.length - 1; i >= 0; i--) {
      if (allDeliveries[i].isLegalDelivery) {
        countLegal++;
      }
      if (countLegal > legalInThisOver && legalInThisOver > 0) {
        sliceIndex = i + 1;
        break;
      }
      if (legalInThisOver === 0 && countLegal > 0) {
        sliceIndex = i + 1;
        break;
      }
    }
    currentOverDeliveries = allDeliveries.slice(sliceIndex);
    
    // If over just ended (0 legal in this over) and we have deliveries, show the just completed over
    if (currentOverDeliveries.length === 0 && allDeliveries.length > 0) {
      currentOverDeliveries = allDeliveries.slice(-ballsPerOver);
    }
  }

  const lastDelivery = allDeliveries[allDeliveries.length - 1];
  const runsThisOver = currentOverDeliveries.reduce((sum, b) => sum + b.totalRuns, 0);

  const getChipStyle = (ball: DeliveryEvent) => {
    if (ball.wicket) {
      return { class: 'wicket', text: 'W' };
    }
    if (ball.isBoundarySix) {
      return { class: 'six', text: '6' };
    }
    if (ball.isBoundaryFour) {
      return { class: 'four', text: '4' };
    }
    if (ball.extraType === 'wide') {
      return { class: 'extra', text: ball.totalRuns > 1 ? `${ball.totalRuns}Wd` : 'Wd' };
    }
    if (ball.extraType === 'no_ball') {
      return { class: 'extra', text: ball.totalRuns > 1 ? `${ball.totalRuns}Nb` : 'Nb' };
    }
    if (ball.extraType === 'bye') {
      return { class: 'extra', text: `${ball.totalRuns}B` };
    }
    if (ball.extraType === 'leg_bye') {
      return { class: 'extra', text: `${ball.totalRuns}Lb` };
    }
    if (ball.batterRuns === 0) {
      return { class: 'dot', text: '•' };
    }
    return { class: '', text: `${ball.batterRuns}` };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Ball Chips Row */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>THIS OVER</span>
          <div className="ball-chips-scroll">
            {currentOverDeliveries.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Over not started</span>
            ) : (
              currentOverDeliveries.map(ball => {
                const chip = getChipStyle(ball);
                return (
                  <div key={ball.id} className={`ball-chip ${chip.class}`}>
                    {chip.text}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 8 }}>
          <span className="tabular-nums" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--turf-green)' }}>
            ={runsThisOver} runs
          </span>
        </div>
      </div>

      {/* Latest Ball Commentary Pill */}
      {lastDelivery && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontWeight: 700, color: '#FFFFFF', flexShrink: 0 }}>
            {innings.oversFormatted}:
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{lastDelivery.commentary}</span>
        </div>
      )}
    </div>
  );
};
