import React, { useState } from 'react';
import { useMatchStore } from '../../store/useMatchStore';
import { storage } from '../../services/storage';
import { Search, Trash2, Play, FileText, Download, Upload, Trophy, AlertTriangle } from 'lucide-react';

export const MatchHistoryScreen: React.FC = () => {
  const { matches, loadMatchById, deleteMatchById, initNewMatchWizard } = useMatchStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'live'>('all');

  const filteredMatches = matches.filter(m => {
    const matchesSearch =
      m.settings.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.teamA.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.teamB.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'completed') return m.status === 'completed';
    if (filterStatus === 'live') return m.status !== 'completed';
    return true;
  });

  const handleExportData = () => {
    const json = storage.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gullyscore_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content && storage.importData(content)) {
        alert('Data imported successfully! Reloading...');
        window.location.reload();
      } else {
        alert('Failed to import backup data. Please check JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800 }}>
            Match History
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {matches.length} saved matches in local storage
          </p>
        </div>

        <button onClick={initNewMatchWizard} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem', width: 'auto' }}>
          + New Match
        </button>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: 36, fontSize: '0.85rem' }}
            placeholder="Search teams or matches..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'completed', 'live'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterStatus(tab)}
              style={{
                flex: 1,
                background: filterStatus === tab ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                border: `1px solid ${filterStatus === tab ? '#10B981' : 'var(--border-subtle)'}`,
                color: filterStatus === tab ? '#34D399' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                padding: '7px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {tab === 'live' ? 'In Progress' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
          <p style={{ fontSize: '0.85rem' }}>No matches found matching your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredMatches.map(m => {
            const isCompleted = m.status === 'completed';
            return (
              <div
                key={m.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-sm)',
                        background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isCompleted ? '#34D399' : '#F87171',
                      }}
                    >
                      {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.settings.date}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete match "${m.settings.title}"?`)) {
                        deleteMatchById(m.id);
                      }
                    }}
                    title="Delete match"
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>{m.settings.title}</div>

                {/* Teams & Scores */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                    <span style={{ color: '#E2E8F0' }}>
                      {m.teamA.emoji} {m.teamA.name}
                    </span>
                    <strong className="tabular-nums" style={{ color: '#FFFFFF' }}>
                      {m.innings1 ? `${m.innings1.totalRuns}/${m.innings1.totalWickets} (${m.innings1.oversFormatted} ov)` : '-'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                    <span style={{ color: '#E2E8F0' }}>
                      {m.teamB.emoji} {m.teamB.name}
                    </span>
                    <strong className="tabular-nums" style={{ color: '#FFFFFF' }}>
                      {m.innings2 ? `${m.innings2.totalRuns}/${m.innings2.totalWickets} (${m.innings2.oversFormatted} ov)` : '-'}
                    </strong>
                  </div>
                </div>

                {m.result && (
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--turf-green)' }}>
                    🏆 {m.result.marginText}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: '1px solid var(--border-subtle)' }}>
                  {!isCompleted ? (
                    <button
                      onClick={() => loadMatchById(m.id)}
                      className="btn-primary"
                      style={{ padding: '8px 12px', fontSize: '0.78rem' }}
                    >
                      <Play size={14} />
                      <span>Resume Match</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => loadMatchById(m.id)}
                      className="btn-secondary"
                      style={{ padding: '8px 12px', fontSize: '0.78rem', width: '100%' }}
                    >
                      <FileText size={14} />
                      <span>View Scorecard</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Backup and Restore Utilities */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          marginTop: 10,
        }}
      >
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
          Data Backup & Migration
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
          Export your matches and squads to a JSON backup file or restore on another device.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button onClick={handleExportData} className="btn-secondary" style={{ padding: '8px', fontSize: '0.78rem' }}>
            <Download size={14} />
            <span>Export Backup</span>
          </button>

          <label
            className="btn-secondary"
            style={{ padding: '8px', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'center' }}
          >
            <Upload size={14} />
            <span>Import Backup</span>
            <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </div>
  );
};
