import { mathsQuestions } from '../src/data/mathsCurriculum';
import { scienceQuestions } from '../src/data/scienceCurriculum';

console.log('--- AUDITING QUESTIONS FOR EMOJI & NUMBER MISMATCHES ---');

const allQuestions = [...mathsQuestions, ...scienceQuestions];

allQuestions.forEach(q => {
  if (q.type === 'multiple_choice' && q.options) {
    q.options.forEach((opt, idx) => {
      // Check for stars
      const starMatch = opt.match(/(⭐+)\s*(\d+)\s*stars?/);
      if (starMatch) {
        const starCount = (starMatch[1].match(/⭐/g) || []).length;
        const numberCount = parseInt(starMatch[2], 10);
        if (starCount !== numberCount) {
          console.log(`[MISMATCH FOUND] ${q.id} (Option ${idx}): "${opt}" -> ${starCount} stars vs number ${numberCount}`);
        }
      }

      // Check for general emojis followed by a count, e.g. "🍎🍎🍎 (5 apples)"
      const emojiMatch = opt.match(/([\p{Emoji_Presentation}\p{Extended_Pictographic}]+)\s*\(?(\d+)\s+([a-zA-Z]+)\)?/u);
      if (emojiMatch) {
        // Count the emojis
        const emojiStr = emojiMatch[1];
        // Split by emoji characters
        const emojiArray = [...emojiStr];
        const emojiCount = emojiArray.length;
        const numberCount = parseInt(emojiMatch[2], 10);
        if (emojiCount !== numberCount) {
          console.log(`[EMOJI COUNT MISMATCH] ${q.id} (Option ${idx}): "${opt}" -> ${emojiCount} icons vs number ${numberCount}`);
        }
      }
    });
  }
});

console.log('--- AUDIT COMPLETE ---');
