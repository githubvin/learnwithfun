import { Subject, Module, Lesson, Question, UserProgress, UserProfile } from './models';
import { mathsLessons, mathsQuestions } from './mathsCurriculum';
import { scienceLessons, scienceQuestions } from './scienceCurriculum';

/* ────────────────────────────────────────
   Subjects
   ──────────────────────────────────────── */
export const subjects: Subject[] = ['maths', 'science'];

/* ────────────────────────────────────────
   Modules (10 Modules Total)
   ──────────────────────────────────────── */
export const mathsModules: Module[] = [
  {
    id: 'maths-m1',
    title: 'Numbers & Place Value',
    description: 'Counting, place value, and comparing numbers up to 100',
    subject: 'maths',
    order: 1,
    icon: 'numeric',
    requiredStarsToUnlock: 0,
  },
  {
    id: 'maths-m2',
    title: 'Addition Adventures',
    description: '1- and 2-digit addition and Make a Ten strategies',
    subject: 'maths',
    order: 2,
    icon: 'plus-circle',
    requiredStarsToUnlock: 6,
  },
  {
    id: 'maths-m3',
    title: 'Subtraction Quests',
    description: '1- and 2-digit subtraction and story problems',
    subject: 'maths',
    order: 3,
    icon: 'minus-circle',
    requiredStarsToUnlock: 24,
  },
  {
    id: 'maths-m4',
    title: 'Shapes & Geometry',
    description: '2D/3D shapes, sides, corners, and sorting',
    subject: 'maths',
    order: 4,
    icon: 'shape',
    requiredStarsToUnlock: 48,
  },
  {
    id: 'maths-m5',
    title: 'Measurement & Time',
    description: 'Length, weight, analog hours, and half-past',
    subject: 'maths',
    order: 5,
    icon: 'clock-outline',
    requiredStarsToUnlock: 74,
  },
];

export const scienceModules: Module[] = [
  {
    id: 'science-s1',
    title: 'Living & Non-Living Things',
    description: 'Identify living organisms, needs, and classification',
    subject: 'science',
    order: 1,
    icon: 'leaf',
    requiredStarsToUnlock: 0,
  },
  {
    id: 'science-s2',
    title: 'Plant Kingdom',
    description: 'Parts of plants, seeds, growth, and life cycles',
    subject: 'science',
    order: 2,
    icon: 'flower',
    requiredStarsToUnlock: 14,
  },
  {
    id: 'science-s3',
    title: 'Animal Safari',
    description: 'Mammals, birds, fish, habitats, and diets',
    subject: 'science',
    order: 3,
    icon: 'paw',
    requiredStarsToUnlock: 36,
  },
  {
    id: 'science-s4',
    title: 'Human Body & 5 Senses',
    description: 'Bones, joints, and the superpower senses',
    subject: 'science',
    order: 4,
    icon: 'eye',
    requiredStarsToUnlock: 60,
  },
  {
    id: 'science-s5',
    title: 'Materials & Matter',
    description: 'Solids, liquids, gases, melting, and everyday uses',
    subject: 'science',
    order: 5,
    icon: 'flask',
    requiredStarsToUnlock: 90,
  },
];

export const allModules: Module[] = [...mathsModules, ...scienceModules];

/* ────────────────────────────────────────
   Curated Lessons & Question Banks
   ──────────────────────────────────────── */
export const lessons: Lesson[] = [...mathsLessons, ...scienceLessons];
export const questions: Question[] = [...mathsQuestions, ...scienceQuestions];

/* ────────────────────────────────────────
   Initial User States
   ──────────────────────────────────────── */
export const initialUserProgress: UserProgress[] = [];

export const initialUserProfile: UserProfile = {
  userId: 'local-learner',
  nickname: 'Little Explorer',
  avatarId: 'lion',
  totalXp: 0,
  currentLevel: 1,
  totalStars: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
};
