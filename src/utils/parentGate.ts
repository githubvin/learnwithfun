export interface MathProblem {
  num1: number;
  num2: number;
  operation: '+' | '×';
  answer: number;
  options: number[];
}

export function generateParentGateProblem(): MathProblem {
  // Use multiplication or double-digit addition (easy for parents, gated for young children)
  const isMult = Math.random() > 0.5;
  let num1: number;
  let num2: number;
  let answer: number;
  let operation: '+' | '×';

  if (isMult) {
    num1 = Math.floor(Math.random() * 5) + 6; // 6 to 10
    num2 = Math.floor(Math.random() * 5) + 6; // 6 to 10
    operation = '×';
    answer = num1 * num2;
  } else {
    num1 = Math.floor(Math.random() * 25) + 18; // 18 to 42
    num2 = Math.floor(Math.random() * 25) + 15; // 15 to 39
    operation = '+';
    answer = num1 + num2;
  }

  // Generate 3 unique distractors close to the answer
  const distractors = new Set<number>();
  const offsets = [-3, -2, -1, 1, 2, 3, 4, 10, -10];
  offsets.sort(() => Math.random() - 0.5);

  for (const offset of offsets) {
    const candidate = answer + offset;
    if (candidate > 0 && candidate !== answer) {
      distractors.add(candidate);
      if (distractors.size === 3) break;
    }
  }

  // Fallback if needed
  let fallbackOffset = 5;
  while (distractors.size < 3) {
    const candidate = answer + fallbackOffset;
    if (candidate > 0 && candidate !== answer) {
      distractors.add(candidate);
    }
    fallbackOffset++;
  }

  const options = Array.from(distractors);
  options.push(answer);
  options.sort(() => Math.random() - 0.5);

  return {
    num1,
    num2,
    operation,
    answer,
    options,
  };
}
