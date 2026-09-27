export interface AvatarItem {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  description: string;
}

export const AVATARS_CATALOG: AvatarItem[] = [
  { id: 'lion', name: 'Leo Lion', emoji: '🦁', bgColor: '#fef3c7', description: 'Brave & curious explorer' },
  { id: 'astronaut', name: 'Star Cadet', emoji: '🚀', bgColor: '#e0e7ff', description: 'Reaching for the cosmic stars' },
  { id: 'unicorn', name: 'Sparkle Unicorn', emoji: '🦄', bgColor: '#fce7f3', description: 'Magical & imaginative learner' },
  { id: 'owl', name: 'Professor Owl', emoji: '🦉', bgColor: '#fef9c3', description: 'Wise & loves reading books' },
  { id: 'dino', name: 'Rexy Dino', emoji: '🦖', bgColor: '#dcfce7', description: 'Super strong problem solver' },
  { id: 'dolphin', name: 'Dash Dolphin', emoji: '🐬', bgColor: '#e0f2fe', description: 'Playful & lightning fast' },
  { id: 'panda', name: 'Bamboo Panda', emoji: '🐼', bgColor: '#f1f5f9', description: 'Calm & thoughtful thinker' },
  { id: 'robot', name: 'Robo Buddy', emoji: '🤖', bgColor: '#ede9fe', description: 'Smart & loves mathematics' },
];

export function getAvatarById(avatarId: string): AvatarItem {
  return AVATARS_CATALOG.find(a => a.id === avatarId) || AVATARS_CATALOG[0];
}
