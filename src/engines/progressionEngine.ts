import { LevelInfo, Lesson, Module, Subject, UserProgress } from '../data/models';

export const MODULE_UNLOCK_STARS: Record<string, number> = {
  'maths-m1': 0,
  'science-s1': 0,
  'maths-m2': 6,
  'science-s2': 14,
  'maths-m3': 24,
  'science-s3': 36,
  'maths-m4': 48,
  'science-s4': 60,
  'maths-m5': 74,
  'science-s5': 90,
};

/**
 * Calculates star rating (0-3) based on percentage score.
 */
export function calculateStars(score: number): number {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= 50) return 1;
  return 0;
}

/**
 * Calculates XP earned from a lesson attempt.
 */
export function calculateLessonXp(score: number, isFirstCompletion: boolean = false): number {
  let baseBonus = 25; // Participation
  if (score >= 90) baseBonus = 100;
  else if (score >= 70) baseBonus = 75;
  else if (score >= 50) baseBonus = 50;

  const multiplier = isFirstCompletion ? 1.2 : 1.0;
  return Math.round(baseBonus * multiplier);
}

/**
 * Calculates player level and progress percentage from total cumulative XP.
 */
export function calculateUserLevel(totalXp: number): LevelInfo {
  const levels = [
    { level: 1, title: 'Curious Seedling', badgeIcon: '🌱', minXp: 0, maxXp: 200 },
    { level: 2, title: 'Junior Explorer', badgeIcon: '🔍', minXp: 201, maxXp: 600 },
    { level: 3, title: 'Knowledge Adventurer', badgeIcon: '🚀', minXp: 601, maxXp: 1200 },
    { level: 4, title: 'Math & Science Star', badgeIcon: '⭐', minXp: 1201, maxXp: 2000 },
    { level: 5, title: 'Grand Master Whiz', badgeIcon: '👑', minXp: 2001, maxXp: Infinity },
  ];

  const current = levels.find(l => totalXp >= l.minXp && (l.maxXp === Infinity || totalXp <= l.maxXp)) || levels[0];

  let progressPercent = 100;
  if (current.level < 5) {
    const span = current.maxXp - current.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round(((totalXp - current.minXp) / span) * 100)));
  }

  return {
    level: current.level,
    title: current.title,
    badgeIcon: current.badgeIcon,
    minXp: current.minXp,
    maxXp: current.maxXp,
    progressPercent,
  };
}

/**
 * Determines whether a module is unlocked based on total stars accumulated.
 */
export function isModuleUnlocked(moduleId: string, totalStars: number): boolean {
  const required = MODULE_UNLOCK_STARS[moduleId] ?? 0;
  return totalStars >= required;
}

/**
 * Returns remaining stars required to unlock a given module.
 */
export function getRemainingStarsToUnlock(moduleId: string, totalStars: number): number {
  const required = MODULE_UNLOCK_STARS[moduleId] ?? 0;
  return Math.max(0, required - totalStars);
}

export interface ModuleStats {
  moduleId: string;
  totalStarsEarned: number;
  maxStars: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  isUnlocked: boolean;
  starsNeededToUnlock: number;
  progressPercent: number;
}

/**
 * Calculates progress and unlock statistics for an individual module.
 */
export function getModuleStats(
  moduleId: string,
  moduleLessons: Lesson[],
  userProgress: UserProgress[],
  totalStars: number
): ModuleStats {
  const lessonIds = new Set(moduleLessons.map(l => l.id));
  const relevantProgress = userProgress.filter(p => lessonIds.has(p.lessonId));

  const totalStarsEarned = relevantProgress.reduce((sum, p) => sum + (p.starsEarned || 0), 0);
  const completedLessonsCount = relevantProgress.filter(p => p.completed).length;
  const totalLessonsCount = moduleLessons.length || 5;
  const maxStars = totalLessonsCount * 3;
  const isUnlocked = isModuleUnlocked(moduleId, totalStars);
  const starsNeededToUnlock = getRemainingStarsToUnlock(moduleId, totalStars);
  const progressPercent = maxStars > 0 ? Math.round((totalStarsEarned / maxStars) * 100) : 0;

  return {
    moduleId,
    totalStarsEarned,
    maxStars,
    completedLessonsCount,
    totalLessonsCount,
    isUnlocked,
    starsNeededToUnlock,
    progressPercent,
  };
}

export interface SubjectStats {
  subject: Subject;
  totalStarsEarned: number;
  maxStars: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  unlockedModulesCount: number;
  totalModulesCount: number;
  progressPercent: number;
}

/**
 * Calculates overall progress across all modules in a subject (Maths or Science).
 */
export function getSubjectStats(
  subject: Subject,
  subjectModules: Module[],
  subjectLessons: Lesson[],
  userProgress: UserProgress[],
  totalStars: number
): SubjectStats {
  const lessonIds = new Set(subjectLessons.map(l => l.id));
  const relevantProgress = userProgress.filter(p => lessonIds.has(p.lessonId));

  const totalStarsEarned = relevantProgress.reduce((sum, p) => sum + (p.starsEarned || 0), 0);
  const completedLessonsCount = relevantProgress.filter(p => p.completed).length;
  const totalLessonsCount = subjectLessons.length || 25;
  const maxStars = totalLessonsCount * 3; // 75 max stars
  const unlockedModulesCount = subjectModules.filter(m => isModuleUnlocked(m.id, totalStars)).length;
  const totalModulesCount = subjectModules.length || 5;
  const progressPercent = maxStars > 0 ? Math.round((totalStarsEarned / maxStars) * 100) : 0;

  return {
    subject,
    totalStarsEarned,
    maxStars,
    completedLessonsCount,
    totalLessonsCount,
    unlockedModulesCount,
    totalModulesCount,
    progressPercent,
  };
}

/**
 * Finds the next recommended lesson for the student in a subject.
 */
export function getNextAvailableLesson(
  subjectLessons: Lesson[],
  userProgress: UserProgress[],
  totalStars: number
): Lesson | null {
  if (!subjectLessons.length) return null;

  // 1. Find the first lesson in an unlocked module that is not yet completed
  for (const lesson of subjectLessons) {
    if (isModuleUnlocked(lesson.moduleId, totalStars)) {
      const progress = userProgress.find(p => p.lessonId === lesson.id);
      if (!progress || !progress.completed) {
        return lesson;
      }
    }
  }

  // 2. If all completed, find first lesson with less than 3 stars in an unlocked module (for mastery)
  for (const lesson of subjectLessons) {
    if (isModuleUnlocked(lesson.moduleId, totalStars)) {
      const progress = userProgress.find(p => p.lessonId === lesson.id);
      if (progress && (progress.starsEarned || 0) < 3) {
        return lesson;
      }
    }
  }

  // 3. Fallback to first lesson
  return subjectLessons[0];
}

