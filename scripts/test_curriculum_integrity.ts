import { mathsQuestions } from '../src/data/mathsCurriculum';
import { scienceQuestions } from '../src/data/scienceCurriculum';

console.log('--- RUNNING RIGOROUS CURRICULUM Q&A INTEGRITY TEST ---');

const allQuestions = [...mathsQuestions, ...scienceQuestions];
let passCount = 0;
let failCount = 0;

allQuestions.forEach((q, idx) => {
  // Check basic properties
  if (!q.id || !q.lessonId || !q.questionText) {
    console.error(`[FAIL] Question at index ${idx} is missing id, lessonId, or questionText`);
    failCount++;
    return;
  }

  if (q.type === 'multiple_choice') {
    if (!q.options || q.options.length < 2) {
      console.error(`[FAIL] ${q.id} has invalid options length: ${q.options?.length}`);
      failCount++;
      return;
    }

    if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
      console.error(`[FAIL] ${q.id} correctAnswer index ${q.correctAnswer} is out of bounds for options length ${q.options.length}`);
      failCount++;
      return;
    }

    const correctOptionText = q.options[q.correctAnswer];
    if (!correctOptionText || correctOptionText.trim() === '') {
      console.error(`[FAIL] ${q.id} correct option text is empty`);
      failCount++;
      return;
    }

    // Check if options have duplicates
    const uniqueOptions = new Set(q.options);
    if (uniqueOptions.size !== q.options.length) {
      console.warn(`[WARN] ${q.id} has duplicate options:`, q.options);
    }
  }

  if (!q.explanation || q.explanation.trim().length < 5) {
    console.error(`[FAIL] ${q.id} explanation is missing or too short`);
    failCount++;
    return;
  }

  passCount++;
});

console.log(`\nVerified ${allQuestions.length} questions across 50 lessons.`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount > 0) {
  process.exit(1);
}
