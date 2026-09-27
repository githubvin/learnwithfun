import { Badge, UserProgress } from '../data/models';

export interface BadgeEvaluationContext {
  allBadges: Badge[];
  userProgress: UserProgress[];
  totalStars: number;
  totalXp: number;
  currentLevel: number;
  streakDays: number;
  latestScore?: number;
}

export interface BadgeEvaluationResult {
  updatedBadges: Badge[];
  newlyUnlocked: Badge[];
  totalBonusXp: number;
}

/** Helper to check if all lessons in a module are completed */
function isModuleCompleted(userProgress: UserProgress[], moduleId: string, lessonCount: number = 5): boolean {
  const completedInModule = userProgress.filter(
    p => p.completed && p.lessonId.startsWith(moduleId)
  );
  return completedInModule.length >= lessonCount;
}

/**
 * Evaluates all 16 badges and returns any newly unlocked badges and bonus XP.
 */
export function evaluateBadges(context: BadgeEvaluationContext): BadgeEvaluationResult {
  const { allBadges, userProgress, totalStars, currentLevel, streakDays, latestScore } = context;

  const newlyUnlocked: Badge[] = [];
  let totalBonusXp = 0;
  const now = new Date().toISOString();

  const completedLessonsCount = userProgress.filter(p => p.completed).length;
  const hasPerfectScore = (latestScore === 100) || userProgress.some(p => p.score === 100 || (p.bestScore ?? 0) === 100);

  const updatedBadges = allBadges.map(badge => {
    if (badge.unlocked) {
      return badge; // Already unlocked
    }

    let shouldUnlock = false;

    switch (badge.id) {
      case 'first_step':
        shouldUnlock = completedLessonsCount >= 1;
        break;
      case 'number_novice':
        shouldUnlock = isModuleCompleted(userProgress, 'maths-m1');
        break;
      case 'nature_scout':
        shouldUnlock = isModuleCompleted(userProgress, 'science-s1');
        break;
      case 'bullseye':
        shouldUnlock = hasPerfectScore;
        break;
      case 'star_collector':
        shouldUnlock = totalStars >= 25;
        break;
      case 'superstar':
        shouldUnlock = totalStars >= 60;
        break;
      case 'addition_ace':
        shouldUnlock = isModuleCompleted(userProgress, 'maths-m2');
        break;
      case 'minus_magician':
        shouldUnlock = isModuleCompleted(userProgress, 'maths-m3');
        break;
      case 'shape_detective':
        shouldUnlock = isModuleCompleted(userProgress, 'maths-m4');
        break;
      case 'time_keeper':
        shouldUnlock = isModuleCompleted(userProgress, 'maths-m5');
        break;
      case 'green_thumb':
        shouldUnlock = isModuleCompleted(userProgress, 'science-s2');
        break;
      case 'animal_kingdom':
        shouldUnlock = isModuleCompleted(userProgress, 'science-s3');
        break;
      case 'super_senses':
        shouldUnlock = isModuleCompleted(userProgress, 'science-s4');
        break;
      case 'little_chemist':
        shouldUnlock = isModuleCompleted(userProgress, 'science-s5');
        break;
      case 'super_streak':
        shouldUnlock = streakDays >= 3;
        break;
      case 'grand_master':
        shouldUnlock = currentLevel >= 5;
        break;
      default:
        break;
    }

    if (shouldUnlock) {
      const unlockedBadge: Badge = {
        ...badge,
        unlocked: true,
        unlockedAt: now,
      };
      newlyUnlocked.push(unlockedBadge);
      totalBonusXp += badge.xpBonus;
      return unlockedBadge;
    }

    return badge;
  });

  return {
    updatedBadges,
    newlyUnlocked,
    totalBonusXp,
  };
}
