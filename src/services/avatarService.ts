export type AvatarStyle = 'notionists' | 'lorelei' | 'adventurer' | 'open-peeps' | 'micah';

export interface AvatarStyleOption {
  id: AvatarStyle;
  label: string;
  description: string;
}

export const AVATAR_STYLE_OPTIONS: AvatarStyleOption[] = [
  { id: 'notionists', label: 'Notionist', description: 'Clean, modern, hand-drawn vector portraits' },
  { id: 'lorelei', label: 'Lorelei', description: 'Artistic, gentle, expressive characters' },
  { id: 'adventurer', label: 'Adventurer', description: 'Bold, adventurous, stylized character' },
  { id: 'open-peeps', label: 'Open Peeps', description: 'Diverse hand-crafted human illustrations' },
  { id: 'micah', label: 'Micah', description: 'Minimalist, elegant modern silhouettes' }
];

const SOFT_PALETTES = [
  'b6e3f4', // sky
  'c0aede', // lavender
  'd1d4f9', // periwinkle
  'ffd5dc', // rose
  'ffdfbf', // peach
  'dcfce7', // mint
  'fef3c7'  // warm amber
].join(',');

/**
 * Returns a high-res deterministic avatar URL from open DiceBear collections
 */
export const getUserAvatarUrl = (
  seed: string = 'Seeker',
  style: AvatarStyle = 'notionists'
): string => {
  const cleanSeed = encodeURIComponent(seed.trim() || 'Faith');
  return `https://api.dicebear.com/9.x/${style}/png?seed=${cleanSeed}&backgroundColor=${SOFT_PALETTES}&size=256`;
};
