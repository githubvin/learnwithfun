import { calculateStars, calculateLessonXp, calculateUserLevel, isModuleUnlocked } from '../src/engines/progressionEngine';
import { evaluateBadges } from '../src/engines/badgeEvaluator';
import { initialBadgesCatalog } from '../src/data/badgesCatalog';
import { UserProgress } from '../src/data/models';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

console.log('--- TESTING PROGRESSION ENGINE ---');

// 1. Test Stars
assert(calculateStars(100) === 3, '100% score awards 3 stars');
assert(calculateStars(90) === 3, '90% score awards 3 stars');
assert(calculateStars(85) === 2, '85% score awards 2 stars');
assert(calculateStars(70) === 2, '70% score awards 2 stars');
assert(calculateStars(65) === 1, '65% score awards 1 star');
assert(calculateStars(50) === 1, '50% score awards 1 star');
assert(calculateStars(40) === 0, '40% score awards 0 stars');

// 2. Test XP
assert(calculateLessonXp(100, true) === 120, '100% score first-time awards 120 XP');
assert(calculateLessonXp(100, false) === 100, '100% score repeat awards 100 XP');
assert(calculateLessonXp(75, false) === 75, '75% score repeat awards 75 XP');
assert(calculateLessonXp(55, false) === 50, '55% score repeat awards 50 XP');
assert(calculateLessonXp(30, false) === 25, '30% score repeat awards 25 XP');

// 3. Test Level Ladder
const l1 = calculateUserLevel(150);
assert(l1.level === 1 && l1.title === 'Curious Seedling', '150 XP is Level 1 Curious Seedling');

const l2 = calculateUserLevel(400);
assert(l2.level === 2 && l2.title === 'Junior Explorer', '400 XP is Level 2 Junior Explorer');

const l3 = calculateUserLevel(900);
assert(l3.level === 3 && l3.title === 'Knowledge Adventurer', '900 XP is Level 3 Knowledge Adventurer');

const l4 = calculateUserLevel(1500);
assert(l4.level === 4 && l4.title === 'Math & Science Star', '1500 XP is Level 4 Math & Science Star');

const l5 = calculateUserLevel(2500);
assert(l5.level === 5 && l5.title === 'Grand Master Whiz', '2500 XP is Level 5 Grand Master Whiz');

// 4. Test Module Gating
assert(isModuleUnlocked('maths-m1', 0) === true, 'Maths M1 is unlocked by default (0 stars)');
assert(isModuleUnlocked('maths-m2', 5) === false, 'Maths M2 locked at 5 stars');
assert(isModuleUnlocked('maths-m2', 6) === true, 'Maths M2 unlocked at 6 stars');
assert(isModuleUnlocked('science-s5', 89) === false, 'Science S5 locked at 89 stars');
assert(isModuleUnlocked('science-s5', 90) === true, 'Science S5 unlocked at 90 stars');

console.log('\n--- TESTING BADGE EVALUATOR ---');

// 5. Test First Step & Bullseye Badges
const mockProgress1: UserProgress[] = [
  {
    userId: 'test-user',
    lessonId: 'maths-m1-l1',
    completed: true,
    score: 100,
    starsEarned: 3,
    xpEarned: 120,
    attempts: 1,
    lastAttempted: new Date().toISOString(),
  }
];

const res1 = evaluateBadges({
  allBadges: initialBadgesCatalog,
  userProgress: mockProgress1,
  totalStars: 3,
  totalXp: 120,
  currentLevel: 1,
  streakDays: 1,
  latestScore: 100,
});

const unlockedIds1 = res1.newlyUnlocked.map(b => b.id);
assert(unlockedIds1.includes('first_step'), 'first_step badge unlocked on 1st lesson');
assert(unlockedIds1.includes('bullseye'), 'bullseye badge unlocked on 100% score');
assert(!unlockedIds1.includes('number_novice'), 'number_novice badge not yet unlocked (needs all 5 M1 lessons)');

// 6. Test Module Completion Badge (number_novice)
const mockProgressM1: UserProgress[] = [
  { userId: 'u', lessonId: 'maths-m1-l1', completed: true, score: 90, starsEarned: 3, xpEarned: 100, attempts: 1, lastAttempted: '' },
  { userId: 'u', lessonId: 'maths-m1-l2', completed: true, score: 90, starsEarned: 3, xpEarned: 100, attempts: 1, lastAttempted: '' },
  { userId: 'u', lessonId: 'maths-m1-l3', completed: true, score: 90, starsEarned: 3, xpEarned: 100, attempts: 1, lastAttempted: '' },
  { userId: 'u', lessonId: 'maths-m1-l4', completed: true, score: 90, starsEarned: 3, xpEarned: 100, attempts: 1, lastAttempted: '' },
  { userId: 'u', lessonId: 'maths-m1-l5', completed: true, score: 90, starsEarned: 3, xpEarned: 100, attempts: 1, lastAttempted: '' },
];

const res2 = evaluateBadges({
  allBadges: initialBadgesCatalog,
  userProgress: mockProgressM1,
  totalStars: 15,
  totalXp: 500,
  currentLevel: 2,
  streakDays: 1,
  latestScore: 90,
});

const unlockedIds2 = res2.newlyUnlocked.map(b => b.id);
assert(unlockedIds2.includes('number_novice'), 'number_novice badge unlocked after all 5 M1 lessons');

// 7. Test Star Collector & Streak Badges
const res3 = evaluateBadges({
  allBadges: initialBadgesCatalog,
  userProgress: mockProgressM1,
  totalStars: 25,
  totalXp: 800,
  currentLevel: 3,
  streakDays: 3,
  latestScore: 80,
});

const unlockedIds3 = res3.newlyUnlocked.map(b => b.id);
assert(unlockedIds3.includes('star_collector'), 'star_collector badge unlocked at 25 stars');
assert(unlockedIds3.includes('super_streak'), 'super_streak badge unlocked on 3 streak days');

console.log('\n--- TESTING CURRICULUM INTEGRATION ---');
import { lessons, questions, mathsModules, scienceModules } from '../src/data/sampleData';

assert(mathsModules.length === 5, '5 Maths modules defined');
assert(scienceModules.length === 5, '5 Science modules defined');
assert(lessons.length === 50, `Exactly 50 lessons present (Found: ${lessons.length})`);
assert(questions.length === 150, `Exactly 150 questions present (Found: ${questions.length})`);

// Ensure every single lesson has questions
lessons.forEach(l => {
  const lQuestions = questions.filter(q => q.lessonId === l.id);
  assert(lQuestions.length >= 3, `Lesson ${l.id} (${l.title}) has ${lQuestions.length} questions (>= 3)`);
});

console.log('\n--- TESTING LESSON COMPLETION & CELEBRATION RESULT MODEL ---');
import { LessonCompletionResult } from '../src/data/models';

const mockCompletion1: LessonCompletionResult = {
  lessonId: 'maths-m1-l1',
  score: 100,
  starsEarned: calculateStars(100),
  xpEarned: calculateLessonXp(100, true),
  isFirstCompletion: true,
  newlyUnlockedBadges: res1.newlyUnlocked,
  isLevelUp: false,
  previousLevel: 1,
  newLevel: calculateUserLevel(120),
};

assert(mockCompletion1.starsEarned === 3, 'Completion result computes 3 stars for 100% score');
assert(mockCompletion1.xpEarned === 120, 'Completion result awards 120 XP for first-time perfect score');
assert(mockCompletion1.newlyUnlockedBadges.length === 2, 'Completion result contains 2 newly unlocked badges (first_step & bullseye)');

// Test Level-Up transition in completion result
const prevXp = 190; // Level 1
const gainedXp = 120; // 190 + 120 = 310 XP -> Level 2
const oldLvl = calculateUserLevel(prevXp);
const newLvl = calculateUserLevel(prevXp + gainedXp);
const isLevelUp = newLvl.level > oldLvl.level;

const mockCompletionLevelUp: LessonCompletionResult = {
  lessonId: 'maths-m1-l2',
  score: 100,
  starsEarned: 3,
  xpEarned: gainedXp,
  isFirstCompletion: true,
  newlyUnlockedBadges: [],
  isLevelUp,
  previousLevel: oldLvl.level,
  newLevel: newLvl,
};

assert(mockCompletionLevelUp.isLevelUp === true, 'Level-up triggers correctly across XP threshold (Level 1 -> Level 2)');
assert(mockCompletionLevelUp.newLevel.title === 'Junior Explorer', 'New level title correctly reflects Junior Explorer');

console.log('\n--- TESTING MODULE & SUBJECT AGGREGATION ENGINE ---');
import { getModuleStats, getSubjectStats, getNextAvailableLesson } from '../src/engines/progressionEngine';

const m1Lessons = lessons.filter(l => l.moduleId === 'maths-m1');
const m1Stats = getModuleStats('maths-m1', m1Lessons, mockProgressM1, 15);
assert(m1Stats.totalStarsEarned === 15, 'M1 stats correctly reports 15 stars earned');
assert(m1Stats.completedLessonsCount === 5, 'M1 stats reports 5 completed lessons');
assert(m1Stats.isUnlocked === true, 'M1 is unlocked');
assert(m1Stats.progressPercent === 100, 'M1 progress is 100%');

const mathsLessonsList = lessons.filter(l => l.moduleId.startsWith('maths'));
const mathsSubjectStats = getSubjectStats('maths', mathsModules, mathsLessonsList, mockProgressM1, 15);
assert(mathsSubjectStats.totalStarsEarned === 15, 'Maths subject stats calculates 15 stars earned');
assert(mathsSubjectStats.unlockedModulesCount === 2, 'Maths subject has 2 unlocked modules at 15 stars (M1 and M2)');
assert(mathsSubjectStats.totalModulesCount === 5, 'Maths subject has 5 total modules');

const nextLesson = getNextAvailableLesson(mathsLessonsList, mockProgressM1, 15);
assert(nextLesson !== null && nextLesson.moduleId === 'maths-m2', 'Next available lesson points to unlocked M2 (first uncompleted lesson)');

// Science Stats test
const scienceLessonsList = lessons.filter(l => l.moduleId.startsWith('science'));
const scienceSubjectStats = getSubjectStats('science', scienceModules, scienceLessonsList, [], 0);
assert(scienceSubjectStats.totalStarsEarned === 0, 'Initial science stars earned is 0');
assert(scienceSubjectStats.unlockedModulesCount === 1, 'Only S1 is unlocked at 0 stars');
assert(scienceSubjectStats.progressPercent === 0, 'Initial science progress is 0%');

// Locked module stats check
const s5Lessons = lessons.filter(l => l.moduleId === 'science-s5');
const s5Stats = getModuleStats('science-s5', s5Lessons, [], 0);
assert(s5Stats.isUnlocked === false, 'S5 is locked at 0 stars');
assert(s5Stats.totalStarsEarned === 0, 'S5 has 0 earned stars');

// Initial next lesson
const initialMathsNextLesson = getNextAvailableLesson(mathsLessonsList, [], 0);
assert(initialMathsNextLesson?.id === 'maths-m1-l1', 'Initial next available lesson is maths-m1-l1');

console.log('\n--- TESTING AUDIO & SPEECH ENGINE ---');
import { audioService } from '../src/services/audioService';

const rawSpeechText = 'Which number is bigger? 🐶 15 > 9 🌟';
const cleaned = audioService.cleanTextForSpeech(rawSpeechText);
assert(!cleaned.includes('🐶') && !cleaned.includes('🌟'), 'Emojis stripped from speech text');
assert(cleaned.includes('is greater than'), 'Mathematical symbol > converted to spoken English "is greater than"');

const settingsBefore = audioService.getSettings();
assert(settingsBefore.speechEnabled === true, 'Default speechEnabled is true');
assert(settingsBefore.sfxEnabled === true, 'Default sfxEnabled is true');

audioService.setSpeechEnabled(false);
audioService.setSfxEnabled(false);
const settingsAfter = audioService.getSettings();
assert(settingsAfter.speechEnabled === false, 'speechEnabled toggled to false');
assert(settingsAfter.sfxEnabled === false, 'sfxEnabled toggled to false');

// Reset to enabled
audioService.setSpeechEnabled(true);
audioService.setSfxEnabled(true);

// Non-browser resilience checks (must not throw)
audioService.playCorrectSound();
audioService.playIncorrectSound();
audioService.playCelebrationFanfare();
audioService.playTapSound();
audioService.stopSpeech();
assert(true, 'AudioService methods execute safely without throwing in non-browser environments');

console.log('\n--- TESTING AVATARS CATALOG & LEARNER PROFILE ENGINE ---');
import { AVATARS_CATALOG, getAvatarById } from '../src/data/avatarsCatalog';

assert(AVATARS_CATALOG.length === 8, 'AVATARS_CATALOG contains 8 kid-friendly avatars');
const avatarIds = new Set(AVATARS_CATALOG.map(a => a.id));
assert(avatarIds.size === 8, 'All 8 avatars have unique IDs');

const lionAvatar = getAvatarById('lion');
assert(lionAvatar.name === 'Leo Lion' && lionAvatar.emoji === '🦁', 'Leo Lion resolved correctly');

const dinoAvatar = getAvatarById('dino');
assert(dinoAvatar.name === 'Rexy Dino' && dinoAvatar.emoji === '🦖', 'Rexy Dino resolved correctly');

const fallbackAvatar = getAvatarById('unknown-avatar-id');
assert(fallbackAvatar.id === 'lion', 'Unknown avatar gracefully falls back to default lion avatar');

console.log('\n--- TESTING PARENTAL GATE & GROWN-UPS CONTROLS ---');
import { generateParentGateProblem } from '../src/utils/parentGate';

for (let i = 0; i < 5; i++) {
  const gateProblem = generateParentGateProblem();
  const expectedAnswer =
    gateProblem.operation === '+'
      ? gateProblem.num1 + gateProblem.num2
      : gateProblem.num1 * gateProblem.num2;

  assert(gateProblem.answer === expectedAnswer, `Parent gate math problem answer is correct (${gateProblem.num1} ${gateProblem.operation} ${gateProblem.num2} = ${gateProblem.answer})`);
  assert(gateProblem.options.length === 4, 'Parent gate provides exactly 4 options');
  assert(gateProblem.options.includes(gateProblem.answer), 'Parent gate options include the correct answer');
  const uniqueOptions = new Set(gateProblem.options);
  assert(uniqueOptions.size === 4, 'All 4 parent gate options are distinct');
}

console.log('\n--- TESTING BADGE HELPERS & TROPHY CABINET ENGINE ---');
import { getBadgeEmoji, getBadgeHint } from '../src/utils/badgeHelpers';

for (const badge of initialBadgesCatalog) {
  const emoji = getBadgeEmoji(badge.id);
  assert(typeof emoji === 'string' && emoji.length > 0, `Badge ${badge.id} has a valid non-empty reward emoji`);
  const hint = getBadgeHint(badge.id);
  assert(typeof hint === 'string' && hint.length > 10, `Badge ${badge.id} has an actionable unlocking hint`);
}

const fallbackEmoji = getBadgeEmoji('unknown-badge');
assert(fallbackEmoji === '🏆', 'Unknown badge falls back to trophy emoji');
const fallbackHint = getBadgeHint('unknown-badge');
assert(fallbackHint.includes('Keep exploring'), 'Unknown badge falls back to encouraging message');

console.log('\n🎉 ALL PROGRESSION, BADGE, CURRICULUM, COMPLETION, AGGREGATION, AUDIO, PROFILE, PARENT GATE & TROPHY TESTS PASSED!');


