import { Match } from '../types/cricket';

/**
 * Generate formatted WhatsApp / Text score update
 */
export function generateShareableText(match: Match): string {
  const inn1 = match.innings1;
  const inn2 = match.innings2;
  const res = match.result;

  let text = `🏏 *${match.settings.title.toUpperCase()}*\n`;
  if (match.settings.location) {
    text += `📍 ${match.settings.location} • 📅 ${match.settings.date}\n`;
  }
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;

  if (inn1) {
    text += `🔹 *${inn1.battingTeamName}*: ${inn1.totalRuns}/${inn1.totalWickets} (${inn1.oversFormatted} ov)\n`;
  }
  if (inn2) {
    text += `🔸 *${inn2.battingTeamName}*: ${inn2.totalRuns}/${inn2.totalWickets} (${inn2.oversFormatted} ov)\n`;
  }

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;

  if (res) {
    text += `🏆 *Result*: ${res.marginText}\n`;
    if (res.manOfTheMatchName) {
      text += `⭐ *Player of the Match*: ${res.manOfTheMatchName} (${res.manOfTheMatchReason || 'All-round'})\n`;
    }
    if (res.bestBatterName && res.bestBatterStat) {
      text += `🏏 *Top Batter*: ${res.bestBatterName} - ${res.bestBatterStat}\n`;
    }
    if (res.bestBowlerName && res.bestBowlerStat) {
      text += `🎯 *Best Bowler*: ${res.bestBowlerName} - ${res.bestBowlerStat}\n`;
    }
  } else if (inn2) {
    text += `🎯 Target: ${inn2.targetRuns} | Need ${inn2.runsNeeded} runs in ${inn2.ballsRemaining} balls\n`;
  }

  text += `\n⚡ Scored live on *TennisScore Pro* • Official Cricket Rules (No LBW)`;
  return text;
}

/**
 * Draw a high-resolution, sports-styled cricket match summary graphic using Canvas 2D
 */
export async function generateScorecardCanvas(match: Match): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Background gradient (Deep Charcoal to Navy Turf)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090D16');
  bgGrad.addColorStop(0.4, '#0D1527');
  bgGrad.addColorStop(1, '#05111B');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Decorative turf radial light
  const turfLight = ctx.createRadialGradient(width / 2, 400, 50, width / 2, 400, 600);
  turfLight.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
  turfLight.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = turfLight;
  ctx.fillRect(0, 0, width, height);

  // Border frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // 2. Brand Header
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ TENNISSCORE PRO', width / 2, 100);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '500 22px sans-serif';
  ctx.fillText('Official Cricket Laws • No LBW • Tournament Scorer', width / 2, 135);

  // Divider
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 180, 160);
  ctx.lineTo(width / 2 + 180, 160);
  ctx.stroke();

  // Match Title & Info
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(match.settings.title.toUpperCase(), width / 2, 230);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 24px sans-serif';
  const locationText = match.settings.location ? `📍 ${match.settings.location}  •  ` : '';
  ctx.fillText(`${locationText}📅 ${match.settings.date}  •  ${match.settings.oversPerInnings} Overs Match`, width / 2, 275);

  // 3. Score Comparison Cards
  const inn1 = match.innings1;
  const inn2 = match.innings2;

  const cardY = 320;
  const cardH = 260;
  const cardW = 960;
  const cardX = (width - cardW) / 2;

  // Background for Scoreboard Box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Team 1 (Left / Top)
  if (inn1) {
    const isWinner1 = match.result?.winnerTeamId === match.teamA.id;
    ctx.textAlign = 'left';
    ctx.fillStyle = match.teamA.color || '#10B981';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${match.teamA.emoji || '🏏'} ${inn1.battingTeamName}`, cardX + 50, cardY + 70);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(`${inn1.totalRuns}/${inn1.totalWickets}`, cardX + cardW - 50, cardY + 75);

    ctx.font = '500 26px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`(${inn1.oversFormatted} ov)`, cardX + cardW - 50, cardY + 115);
  }

  // VS Separator
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(cardX + 40, cardY + 130);
  ctx.lineTo(cardX + cardW - 40, cardY + 130);
  ctx.stroke();

  // Team 2 (Right / Bottom)
  if (inn2) {
    ctx.textAlign = 'left';
    ctx.fillStyle = match.teamB.color || '#F59E0B';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${match.teamB.emoji || '🔥'} ${inn2.battingTeamName}`, cardX + 50, cardY + 200);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(`${inn2.totalRuns}/${inn2.totalWickets}`, cardX + cardW - 50, cardY + 205);

    ctx.font = '500 26px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`(${inn2.oversFormatted} ov)`, cardX + cardW - 50, cardY + 245);
  }

  // 4. Winner Banner
  const winY = 620;
  if (match.result) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.roundRect(cardX, winY, cardW, 110, 20);
    ctx.fill();
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`🏆 ${match.result.marginText.toUpperCase()}`, width / 2, winY + 68);
  }

  // 5. Highlights Grid: Man of Match, Top Batter, Best Bowler
  const gridY = 760;
  const colW = (cardW - 40) / 2;

  // Box 1: Player of the Match
  const potmY = gridY;
  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.beginPath();
  ctx.roundRect(cardX, potmY, cardW, 130, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('⭐ PLAYER OF THE MATCH (MVP)', cardX + 40, potmY + 45);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText(match.result?.manOfTheMatchName || 'Outstanding Player', cardX + 40, potmY + 95);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#FCD34D';
  ctx.font = '600 28px sans-serif';
  ctx.fillText(match.result?.manOfTheMatchReason || 'Match Winning Performance', cardX + cardW - 40, potmY + 80);

  // Box 2: Top Batter
  const perfY = 920;
  const perfH = 160;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.beginPath();
  ctx.roundRect(cardX, perfY, colW, perfH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('🏏 TOP BATTER', cardX + 30, perfY + 45);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(match.result?.bestBatterName || 'Top Scorer', cardX + 30, perfY + 90);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 26px sans-serif';
  ctx.fillText(match.result?.bestBatterStat || '-', cardX + 30, perfY + 130);

  // Box 3: Best Bowler
  const col2X = cardX + colW + 40;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.beginPath();
  ctx.roundRect(col2X, perfY, colW, perfH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.stroke();

  ctx.fillStyle = '#A78BFA';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('🎯 BEST BOWLER', col2X + 30, perfY + 45);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(match.result?.bestBowlerName || 'Best Figures', col2X + 30, perfY + 90);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 26px sans-serif';
  ctx.fillText(match.result?.bestBowlerStat || '-', col2X + 30, perfY + 130);

  // 6. Tennis Cricket Rules Tagline & Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '500 22px sans-serif';
  ctx.fillText('Official Tennis Ball Cricket Laws • Standard ICC Rules • Zero LBW', width / 2, 1140);

  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Official TennisScore Verified Tournament Scorecard', width / 2, 1220);

  ctx.fillStyle = '#64748B';
  ctx.font = '500 18px sans-serif';
  ctx.fillText('Tournament-Grade Tennis Ball Cricket Scoring App', width / 2, 1260);

  return canvas;
}

/**
 * Share image via native Web Share API or download PNG
 */
export async function shareMatchCard(match: Match): Promise<{ sharedViaNative: boolean }> {
  const canvas = await generateScorecardCanvas(match);

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve({ sharedViaNative: false });
        return;
      }

      const file = new File([blob], `${match.settings.title.replace(/\s+/g, '_')}_scorecard.png`, {
        type: 'image/png',
      });

      // Try native mobile share sheet
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: match.settings.title,
            text: generateShareableText(match),
            files: [file],
          });
          resolve({ sharedViaNative: true });
          return;
        } catch (e) {
          console.warn('Native share cancelled or failed, falling back to download', e);
        }
      }

      // Fallback: trigger direct PNG download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${match.settings.title.replace(/\s+/g, '_')}_scorecard.png`;
      link.click();
      URL.revokeObjectURL(url);
      resolve({ sharedViaNative: false });
    }, 'image/png');
  });
}
