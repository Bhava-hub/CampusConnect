import React from 'react';

// Pixel art rendered as crisp SVG grids. Palette chars map to theme tokens.
const PAL = {
  n: 'var(--navy)',
  c: 'var(--cream)',
  m: 'var(--mint)',
  o: 'var(--orange)',
  w: 'oklch(0.995 0.008 85)',
  s: 'var(--navy-soft)',
};

export const ICONS = {
  home: ['...nn...', '..nmmn..', '.nmmmmn.', 'nmmmmmmn', '.nmmmmn.', '.nmoomn.', '.nmoomn.', '.nnnnnn.'],
  question: ['.nnnnnn.', 'nooooon.', 'nwwnnwon', 'nwwwnwon', 'nwwnwwon', '.nonwon.', '..nnnn..', '...nn...'],
  team: ['.nn..nn.', 'nmmn.noon', 'nmmnnoon', '.nn..nn.', 'nmmmnooo', 'nmmmnooo', 'nmmmnooo', 'nnnnnnnn'],
  activity: ['........', '......nn', '.....nmn', '..n..nn.', '.nmn.n..', 'nn.nmn..', 'n...n...', '........'],
  bookmark: ['.nnnnnn.', '.noooon.', '.noooon.', '.noooon.', '.noooon.', '.nonnon.', '.nn..nn.', '........'],
  user: ['..nnnn..', '.nccccn.', '.ncnncn.', '.ncccc n', '..nnnn..', '.nmmmmn.', 'nmmmmmmn', 'nnnnnnnn'],
  star: ['...nn...', '...on...', 'nnnoonnn', 'nooooooon', '.noooon.', '.nonnon.', 'nnn..nnn', '........'],
  up: ['...nn...', '..nmmn..', '.nmmmmn.', 'nmmmmmmn', 'nnnmmnnn', '..nmmn..', '..nmmn..', '..nnnn..'],
  chat: ['nnnnnnnn', 'nwwwwwwn', 'nwnnnnwn', 'nwwwwwwn', 'nwnnnwwn', 'nwwwwwwn', 'nnnwnnnn', '..nn....'],
  book: ['nnnnnnnn', 'nooonmmn', 'nooonmmn', 'nooonmmn', 'nooonmmn', 'nooonmmn', 'nnnnnnnn', 'nwwwwwwn'],
  computer: ['nnnnnnnn', 'nmmmmmmn', 'nmnmmmmn', 'nmmmnmmn', 'nmmmmmmn', 'nnnnnnnn', '...nn...', '.nnnnnn.'],
  flask: ['..nnnn..', '...nn...', '...nn...', '..nmmn..', '.nmmmmn.', 'nmmomomn', 'nmooooon', 'nnnnnnnn'],
  sigma: ['nnnnnnnn', 'noooooon', '.nn.....', '..nn....', '..nn....', '.nn.....', 'noooooon', 'nnnnnnnn'],
  atom: ['...nn...', '.n.nn.n.', '..noon..', 'nnoooonn', 'nnoooonn', '..noon..', '.n.nn.n.', '...nn...'],
  check: ['........', '......nn', '.....nmn', 'nn..nmn.', 'nmnnmn..', '.nmmn...', '..nn....', '........'],
  plus: ['...nn...', '...nn...', '...nn...', 'nnnnnnnn', 'nnnnnnnn', '...nn...', '...nn...', '...nn...'],
  search: ['.nnnn...', 'nwwwwn..', 'nwwwwn..', 'nwwwwn..', '.nnnnn..', '.....nn.', '......nn', '.......n'],
  trophy: ['nnnnnnnn', 'noooooon', '.noooon.', '..noon..', '...nn...', '...nn...', '..nnnn..', '.nnnnnn.'],
  heart: ['.nn..nn.', 'noonnoon', 'noooooon', 'noooooon', '.noooon.', '..noon..', '...nn...', '........'],
  rocket: ['...nn...', '..nwwn..', '..nwwn..', '.nwmmwn.', '.nwwwwn.', 'nnwwwwnn', 'n.nnnn.n', '..o..o..'],
};

export function PixelIcon({ name, size = 20, className = '', style = {} }) {
  const grid = ICONS[name] || ICONS['star'];
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" className={`shrink-0 ${className}`} style={style} aria-hidden="true">
      {grid.flatMap((row, y) =>
        row.slice(0, 8).split('').map((ch, x) => (PAL[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={PAL[ch]} /> : null)),
      )}
    </svg>
  );
}

const HAIR = ['var(--navy)', 'var(--orange)', 'oklch(0.45 0.08 50)', 'var(--navy-soft)'];
const SHIRT = ['var(--mint)', 'var(--orange)', 'var(--navy-soft)', 'oklch(0.75 0.1 220)'];
const BG = ['var(--mint-soft)', 'var(--orange-soft)', 'oklch(0.92 0.03 250)', 'oklch(0.94 0.04 100)'];

export function PixelAvatar({ seed = 'user', size = 36, style = {} }) {
  let h = 0;
  for (const ch of String(seed || 'user')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hair = HAIR[h % 4], shirt = SHIRT[(h >> 2) % 4], bg = BG[(h >> 4) % 4];
  const skin = ['oklch(0.85 0.06 60)', 'oklch(0.7 0.08 55)', 'oklch(0.55 0.08 50)'][(h >> 6) % 3];
  const long = (h >> 8) % 2 === 0;
  const px = [];
  for (let x = 2; x < 8; x++) px.push([x, 1, hair]);
  for (let x = 1; x < 9; x++) px.push([x, 2, hair]);
  for (let y = 3; y < 7; y++) for (let x = 2; x < 8; x++) px.push([x, y, skin]);
  px.push([1, 3, hair], [8, 3, hair]);
  if (long) for (let y = 4; y < 8; y++) px.push([1, y, hair], [8, y, hair]);
  px.push([3, 4, 'var(--navy)'], [6, 4, 'var(--navy)'], [4, 6, 'var(--navy)'], [5, 6, 'var(--navy)']);
  for (let x = 1; x < 9; x++) { px.push([x, 8, shirt]); px.push([x, 9, shirt]); }
  for (let x = 4; x < 6; x++) px.push([x, 7, skin]);
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" shapeRendering="crispEdges" className="shrink-0" style={{ background: bg, border: '2px solid var(--navy)', display: 'inline-block', ...style }} aria-hidden="true">
      {px.map(([x, y, f], i) => <rect key={i} x={x} y={y} width={1} height={1} fill={f} />)}
    </svg>
  );
}

export function PixelStars({ className = '', style = {} }) {
  return (
    <div className={`pointer-events-none flex gap-6 ${className}`} style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'none', ...style }} aria-hidden="true">
      <PixelIcon name="star" size={14} /><PixelIcon name="star" size={10} /><PixelIcon name="star" size={16} />
    </div>
  );
}

export default { PixelIcon, PixelAvatar, PixelStars, ICONS };
