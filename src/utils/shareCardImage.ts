import type { DayInfo } from '@/types';
import type { DayTone } from '@/utils/actionableDay';

export interface ShareCardPayload {
  day: DayInfo;
  name?: string;
  storyTitle: string;
  action: string;
  doList: string[];
  tone: DayTone;
  toneLabel: string;
  planet: string;
  icon: string;
  brand: string;
  footer: string;
  locale?: string;
}

function toneColors(tone: DayTone) {
  if (tone === 'favorable') {
    return { accent: '#4ade80', glow: 'rgba(74,222,128,0.35)', label: '#bbf7d0' };
  }
  if (tone === 'challenging') {
    return { accent: '#f87171', glow: 'rgba(248,113,113,0.35)', label: '#fecaca' };
  }
  return { accent: '#facc15', glow: 'rgba(250,204,21,0.3)', label: '#fef08a' };
}

/** Renders a 1080×1350 story-style card for Instagram / Telegram / WhatsApp. */
export function renderDayShareCard(payload: ShareCardPayload): HTMLCanvasElement {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const colors = toneColors(payload.tone);

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0b0914');
  bg.addColorStop(0.45, '#151028');
  bg.addColorStop(1, '#1a1028');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft aurora orbs
  const orb = (x: number, y: number, r: number, c: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, c);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  orb(220, 220, 380, 'rgba(139,92,246,0.28)');
  orb(900, 380, 420, colors.glow);
  orb(540, 1100, 360, 'rgba(236,72,153,0.18)');

  // Card panel
  const pad = 72;
  roundRect(ctx, pad, pad + 40, W - pad * 2, H - pad * 2 - 80, 48);
  ctx.fillStyle = 'rgba(255,255,255,0.055)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Brand
  ctx.fillStyle = 'rgba(245,215,142,0.9)';
  ctx.font = '600 28px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(payload.brand.toUpperCase(), W / 2, pad + 110);

  // Greeting / name
  if (payload.name) {
    ctx.fillStyle = 'rgba(247,244,255,0.72)';
    ctx.font = '500 32px system-ui, -apple-system, sans-serif';
    ctx.fillText(payload.name, W / 2, pad + 170);
  }

  // Icon circle
  const cy = pad + 320;
  ctx.beginPath();
  ctx.arc(W / 2, cy, 90, 0, Math.PI * 2);
  ctx.fillStyle = `${colors.accent}33`;
  ctx.fill();
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = '72px serif';
  ctx.fillStyle = '#fff';
  ctx.fillText(payload.icon || '✦', W / 2, cy + 26);

  // Number · planet
  ctx.fillStyle = '#fff';
  ctx.font = '700 56px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    `${payload.day.personalNumber} · ${payload.planet}`,
    W / 2,
    cy + 160
  );

  // Tone badge
  const badgeW = 280;
  const badgeH = 52;
  const bx = (W - badgeW) / 2;
  const by = cy + 190;
  roundRect(ctx, bx, by, badgeW, badgeH, 26);
  ctx.fillStyle = `${colors.accent}28`;
  ctx.fill();
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = colors.label;
  ctx.font = '650 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(payload.toneLabel.toUpperCase(), W / 2, by + 35);

  // Story title
  ctx.fillStyle = '#f7f4ff';
  ctx.font = '600 48px Georgia, "Times New Roman", serif';
  wrapText(ctx, payload.storyTitle, W / 2, by + 130, W - pad * 2 - 40, 56, 2);

  // Action
  ctx.fillStyle = 'rgba(247,244,255,0.78)';
  ctx.font = '500 30px system-ui, -apple-system, sans-serif';
  wrapText(ctx, payload.action, W / 2, by + 260, W - pad * 2 - 60, 40, 3);

  // Do list
  let listY = by + 420;
  ctx.textAlign = 'left';
  const listX = pad + 80;
  for (const item of payload.doList.slice(0, 3)) {
    ctx.fillStyle = colors.accent;
    ctx.font = '700 28px system-ui, -apple-system, sans-serif';
    ctx.fillText('✓', listX, listY);
    ctx.fillStyle = 'rgba(247,244,255,0.88)';
    ctx.font = '500 28px system-ui, -apple-system, sans-serif';
    const clipped = item.length > 42 ? `${item.slice(0, 40)}…` : item;
    ctx.fillText(clipped, listX + 40, listY);
    listY += 48;
  }

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(247,244,255,0.45)';
  ctx.font = '500 24px system-ui, -apple-system, sans-serif';
  wrapText(ctx, payload.footer, W / 2, H - pad - 50, W - pad * 2 - 40, 32, 2);

  return canvas;
}

export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png', 0.95);
  });
}

export async function shareDayCardImage(
  canvas: HTMLCanvasElement,
  filename = 'my-day.png'
): Promise<'shared' | 'downloaded' | 'failed'> {
  const blob = await canvasToBlob(canvas);
  if (!blob) return 'failed';

  const file = new File([blob], filename, { type: 'image/png' });

  try {
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'My day',
      });
      return 'shared';
    }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return 'failed';
  }

  // Fallback: download
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(/\s+/);
  let line = '';
  let lines = 0;
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = words[i];
      cy += lineHeight;
      lines += 1;
      if (lines >= maxLines - 1) {
        // last line — ellipsis if leftover
        let rest = words.slice(i).join(' ');
        while (ctx.measureText(rest + '…').width > maxWidth && rest.length > 3) {
          rest = rest.slice(0, -1);
        }
        ctx.fillText(rest + (i < words.length - 1 ? '…' : ''), x, cy);
        return;
      }
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}
