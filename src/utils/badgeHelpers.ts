export function getBadgeEmoji(badgeId: string): string {
  switch (badgeId) {
    case 'first_step':
      return '🧭';
    case 'number_novice':
      return '🔢';
    case 'nature_scout':
      return '🌿';
    case 'bullseye':
      return '🎯';
    case 'star_collector':
      return '⭐';
    case 'superstar':
      return '🌟';
    case 'addition_ace':
      return '➕';
    case 'minus_magician':
      return '➖';
    case 'shape_detective':
      return '🔷';
    case 'time_keeper':
      return '⏰';
    case 'green_thumb':
      return '🌻';
    case 'animal_kingdom':
      return '🐾';
    case 'super_senses':
      return '👁️';
    case 'little_chemist':
      return '🧪';
    case 'super_streak':
      return '🔥';
    case 'grand_master':
      return '👑';
    default:
      return '🏆';
  }
}

export function getBadgeHint(badgeId: string): string {
  switch (badgeId) {
    case 'first_step':
      return 'Finish any lesson in Maths Kingdom or Science Safari to begin!';
    case 'number_novice':
      return 'Complete all 5 lessons in Numbers & Place Value.';
    case 'nature_scout':
      return 'Complete all 5 lessons in Living & Non-Living Things.';
    case 'bullseye':
      return 'Score a perfect 100% on any lesson challenge!';
    case 'star_collector':
      return 'Collect 25 glowing stars across your lessons.';
    case 'superstar':
      return 'Earn 60 stars across Maths Kingdom and Science Safari!';
    case 'addition_ace':
      return 'Complete all 5 lessons in Addition Adventures.';
    case 'minus_magician':
      return 'Complete all 5 lessons in Subtraction Quests.';
    case 'shape_detective':
      return 'Complete all 5 lessons in Shapes & Geometry.';
    case 'time_keeper':
      return 'Complete all 5 lessons in Measurement & Time.';
    case 'green_thumb':
      return 'Complete all 5 lessons in Wonderful Plants.';
    case 'animal_kingdom':
      return 'Complete all 5 lessons in Animal Adventures.';
    case 'super_senses':
      return 'Complete all 5 lessons in Body & The 5 Senses.';
    case 'little_chemist':
      return 'Complete all 5 lessons in Materials & Matter.';
    case 'super_streak':
      return 'Log in and play learning quests 3 days in a row!';
    case 'grand_master':
      return 'Reach Level 5 (Grand Master Whiz) with 2,000+ XP!';
    default:
      return 'Keep exploring and completing quests to unlock this badge!';
  }
}
