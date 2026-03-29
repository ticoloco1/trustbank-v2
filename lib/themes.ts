// TrustBank Themes — matched to old design

export interface Theme {
  id: string;
  label: string;
  emoji: string;
  description: string;
  category: 'dark' | 'light' | 'gradient';
  previewBg: string;
  previewText: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
}

export const THEMES: Theme[] = [
  // ── Dark ──────────────────────────────────────────────────
  {
    id: 'dark', label: 'Dark', emoji: '🌑', description: 'Classic dark',
    category: 'dark', previewBg: '#0a0a0f', previewText: '#f1f5f9',
    bg: '#0a0a0f', surface: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.09)',
    text: '#f1f5f9', muted: 'rgba(241,245,249,0.45)', accent: '#818cf8',
  },
  {
    id: 'midnight', label: 'Midnight', emoji: '🌃', description: 'Deep midnight',
    category: 'dark', previewBg: '#050508', previewText: '#f1f5f9',
    bg: '#050508', surface: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.07)',
    text: '#f1f5f9', muted: 'rgba(241,245,249,0.4)', accent: '#6366f1',
  },
  {
    id: 'noir', label: 'Noir', emoji: '⬛', description: 'Pure black',
    category: 'dark', previewBg: '#000000', previewText: '#ffffff',
    bg: '#000000', surface: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)',
    text: '#ffffff', muted: 'rgba(255,255,255,0.45)', accent: '#ffffff',
  },
  {
    id: 'ocean', label: 'Ocean', emoji: '🌊', description: 'Deep blue',
    category: 'dark', previewBg: '#030d1a', previewText: '#e0f2fe',
    bg: '#030d1a', surface: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.15)',
    text: '#e0f2fe', muted: 'rgba(224,242,254,0.45)', accent: '#38bdf8',
  },
  {
    id: 'forest', label: 'Forest', emoji: '🌿', description: 'Dark green',
    category: 'dark', previewBg: '#030d06', previewText: '#dcfce7',
    bg: '#030d06', surface: 'rgba(74,222,128,0.07)', border: 'rgba(74,222,128,0.15)',
    text: '#dcfce7', muted: 'rgba(220,252,231,0.45)', accent: '#4ade80',
  },
  {
    id: 'rose', label: 'Rose', emoji: '🌹', description: 'Dark rose',
    category: 'dark', previewBg: '#1a0010', previewText: '#ffe4e6',
    bg: '#1a0010', surface: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.15)',
    text: '#ffe4e6', muted: 'rgba(255,228,230,0.45)', accent: '#fb7185',
  },
  {
    id: 'gold', label: 'Gold', emoji: '✨', description: 'Dark gold',
    category: 'dark', previewBg: '#0c0900', previewText: '#fef3c7',
    bg: '#0c0900', surface: 'rgba(253,230,138,0.07)', border: 'rgba(253,230,138,0.15)',
    text: '#fef3c7', muted: 'rgba(254,243,199,0.45)', accent: '#fde68a',
  },
  {
    id: 'nebula', label: 'Nebula', emoji: '🔮', description: 'Space purple',
    category: 'dark', previewBg: '#0d0520', previewText: '#f3e8ff',
    bg: '#0d0520', surface: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.15)',
    text: '#f3e8ff', muted: 'rgba(243,232,255,0.45)', accent: '#a855f7',
  },
  {
    id: 'ember', label: 'Ember', emoji: '🔥', description: 'Dark orange',
    category: 'dark', previewBg: '#1c0800', previewText: '#ffedd5',
    bg: '#1c0800', surface: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.15)',
    text: '#ffedd5', muted: 'rgba(255,237,213,0.45)', accent: '#f97316',
  },
  {
    id: 'arctic', label: 'Arctic', emoji: '🧊', description: 'Icy blue',
    category: 'dark', previewBg: '#0a1628', previewText: '#e0f2fe',
    bg: '#0a1628', surface: 'rgba(125,211,252,0.07)', border: 'rgba(125,211,252,0.15)',
    text: '#e0f2fe', muted: 'rgba(224,242,254,0.4)', accent: '#7dd3fc',
  },
  {
    id: 'matrix', label: 'Matrix', emoji: '💻', description: 'Hacker green',
    category: 'dark', previewBg: '#000800', previewText: '#00ff41',
    bg: '#000800', surface: 'rgba(0,255,65,0.05)', border: 'rgba(0,255,65,0.2)',
    text: '#00ff41', muted: 'rgba(0,255,65,0.5)', accent: '#00ff41',
  },
  {
    id: 'steel', label: 'Steel', emoji: '🔩', description: 'Cool grey',
    category: 'dark', previewBg: '#1a1f2e', previewText: '#c8d3e0',
    bg: '#1a1f2e', surface: 'rgba(148,163,184,0.07)', border: 'rgba(148,163,184,0.15)',
    text: '#c8d3e0', muted: 'rgba(200,211,224,0.45)', accent: '#94a3b8',
  },
  {
    id: 'aurora', label: 'Aurora', emoji: '🌌', description: 'Northern lights',
    category: 'gradient', previewBg: '#050218', previewText: '#e0e7ff',
    bg: '#050218', surface: 'rgba(129,140,248,0.07)', border: 'rgba(129,140,248,0.15)',
    text: '#e0e7ff', muted: 'rgba(224,231,255,0.45)', accent: '#818cf8',
  },
  {
    id: 'crimson', label: 'Crimson', emoji: '🩸', description: 'Blood red',
    category: 'dark', previewBg: '#1a0505', previewText: '#fecaca',
    bg: '#1a0505', surface: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.15)',
    text: '#fecaca', muted: 'rgba(254,202,202,0.45)', accent: '#ef4444',
  },
  {
    id: 'hex', label: 'Hex', emoji: '⬡', description: 'Cyber cyan',
    category: 'dark', previewBg: '#0f1923', previewText: '#e2e8f0',
    bg: '#0f1923', surface: 'rgba(6,182,212,0.07)', border: 'rgba(6,182,212,0.15)',
    text: '#e2e8f0', muted: 'rgba(226,232,240,0.45)', accent: '#06b6d4',
  },
  // ── Light ─────────────────────────────────────────────────
  {
    id: 'white', label: 'White', emoji: '🤍', description: 'Clean white',
    category: 'light', previewBg: '#ffffff', previewText: '#0f172a',
    bg: '#ffffff', surface: 'rgba(0,0,0,0.04)', border: 'rgba(0,0,0,0.08)',
    text: '#0f172a', muted: 'rgba(15,23,42,0.5)', accent: '#6366f1',
  },
  {
    id: 'ivory', label: 'Ivory', emoji: '📜', description: 'Warm white',
    category: 'light', previewBg: '#fafafa', previewText: '#18181b',
    bg: '#fafafa', surface: 'rgba(0,0,0,0.04)', border: 'rgba(0,0,0,0.07)',
    text: '#18181b', muted: 'rgba(24,24,27,0.5)', accent: '#6366f1',
  },
  {
    id: 'beige', label: 'Beige', emoji: '🧈', description: 'Soft cream',
    category: 'light', previewBg: '#faf7f2', previewText: '#1c1917',
    bg: '#faf7f2', surface: 'rgba(0,0,0,0.03)', border: 'rgba(0,0,0,0.07)',
    text: '#1c1917', muted: 'rgba(28,25,23,0.5)', accent: '#b45309',
  },
  {
    id: 'sky', label: 'Sky', emoji: '🩵', description: 'Light blue',
    category: 'light', previewBg: '#f0f9ff', previewText: '#0c4a6e',
    bg: '#f0f9ff', surface: 'rgba(14,165,233,0.06)', border: 'rgba(14,165,233,0.15)',
    text: '#0c4a6e', muted: 'rgba(12,74,110,0.5)', accent: '#0ea5e9',
  },
  {
    id: 'mint', label: 'Mint', emoji: '🌱', description: 'Fresh green',
    category: 'light', previewBg: '#f0fdf4', previewText: '#14532d',
    bg: '#f0fdf4', surface: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.15)',
    text: '#14532d', muted: 'rgba(20,83,45,0.5)', accent: '#16a34a',
  },
  {
    id: 'lavender', label: 'Lavender', emoji: '💜', description: 'Soft purple',
    category: 'light', previewBg: '#faf5ff', previewText: '#4c1d95',
    bg: '#faf5ff', surface: 'rgba(124,58,237,0.06)', border: 'rgba(124,58,237,0.15)',
    text: '#4c1d95', muted: 'rgba(76,29,149,0.5)', accent: '#7c3aed',
  },
  {
    id: 'peach', label: 'Peach', emoji: '🍑', description: 'Warm peach',
    category: 'light', previewBg: '#fff7ed', previewText: '#7c2d12',
    bg: '#fff7ed', surface: 'rgba(234,88,12,0.05)', border: 'rgba(234,88,12,0.15)',
    text: '#7c2d12', muted: 'rgba(124,45,18,0.5)', accent: '#ea580c',
  },
  {
    id: 'lemon', label: 'Lemon', emoji: '🍋', description: 'Bright lemon',
    category: 'light', previewBg: '#fefce8', previewText: '#713f12',
    bg: '#fefce8', surface: 'rgba(202,138,4,0.05)', border: 'rgba(202,138,4,0.15)',
    text: '#713f12', muted: 'rgba(113,63,18,0.5)', accent: '#ca8a04',
  },
  {
    id: 'blush', label: 'Blush', emoji: '🌸', description: 'Soft pink',
    category: 'light', previewBg: '#fdf2f8', previewText: '#831843',
    bg: '#fdf2f8', surface: 'rgba(219,39,119,0.05)', border: 'rgba(219,39,119,0.15)',
    text: '#831843', muted: 'rgba(131,24,67,0.5)', accent: '#db2777',
  },
  {
    id: 'sand', label: 'Sand', emoji: '🏖️', description: 'Desert sand',
    category: 'light', previewBg: '#fdf4e7', previewText: '#44260a',
    bg: '#fdf4e7', surface: 'rgba(217,119,6,0.05)', border: 'rgba(217,119,6,0.15)',
    text: '#44260a', muted: 'rgba(68,38,10,0.5)', accent: '#d97706',
  },
  {
    id: 'cloud', label: 'Cloud', emoji: '☁️', description: 'Misty blue',
    category: 'light', previewBg: '#f8f9ff', previewText: '#1e3a5f',
    bg: '#f8f9ff', surface: 'rgba(59,130,246,0.05)', border: 'rgba(59,130,246,0.12)',
    text: '#1e3a5f', muted: 'rgba(30,58,95,0.5)', accent: '#3b82f6',
  },
  {
    id: 'nordic', label: 'Nordic', emoji: '🇸🇪', description: 'Scandinavian',
    category: 'light', previewBg: '#f5f5f0', previewText: '#2d2d2a',
    bg: '#f5f5f0', surface: 'rgba(0,0,0,0.04)', border: 'rgba(0,0,0,0.07)',
    text: '#2d2d2a', muted: 'rgba(45,45,42,0.5)', accent: '#4b7bb5',
  },
  {
    id: 'sakura', label: 'Sakura', emoji: '🌺', description: 'Cherry blossom',
    category: 'light', previewBg: '#fff1f5', previewText: '#4a1530',
    bg: '#fff1f5', surface: 'rgba(225,29,121,0.05)', border: 'rgba(225,29,121,0.15)',
    text: '#4a1530', muted: 'rgba(74,21,48,0.5)', accent: '#e11d79',
  },
  {
    id: 'cream', label: 'Cream', emoji: '🍦', description: 'Vanilla cream',
    category: 'light', previewBg: '#fdf6e3', previewText: '#3b2f1e',
    bg: '#fdf6e3', surface: 'rgba(0,0,0,0.03)', border: 'rgba(0,0,0,0.07)',
    text: '#3b2f1e', muted: 'rgba(59,47,30,0.5)', accent: '#b45309',
  },
];
