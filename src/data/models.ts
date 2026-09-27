// Enhanced data models for the Learning With Fun app

export type Subject = 'maths' | 'science';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 
  | 'multiple_choice'
  | 'image_selection' 
  | 'true_false'
  | 'drag_drop'
  | 'matching'
  | 'ordering';

export interface Module {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  order: number;
  icon?: string; // Icon name for display
  requiredStarsToUnlock?: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  order: number;
  estimatedDuration: number; // in seconds (3-7 minutes = 180-420 seconds)
  // Content fields for the Learn → Play → Earn → Progress flow
  introduction: string;    // Learn: Brief concept intro
  explanation: string;     // Play: Interactive explanation
  demonstration: string;   // Earn: Demonstration of concept
}

// Enhanced question model with support for different types
export interface BaseQuestion {
  id: string;
  lessonId: string;
  type: QuestionType;
  difficulty: Difficulty;
  questionText: string;
  explanation?: string; // Explanation shown after answering
  points: number; // Points awarded for correct answer
  hint?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[]; // Array of option texts
  correctAnswer: number; // Index of correct option (0-based)
}

export interface ImageSelectionQuestion extends BaseQuestion {
  type: 'image_selection';
  questionImage?: string; // URL or asset path for main image
  options: Array<{
    id: string;
    imageUrl?: string;
    label?: string;
  }>;
  correctAnswer: string; // ID of correct option
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correctAnswer: boolean; // true or false
}

export interface DragDropQuestion extends BaseQuestion {
  type: 'drag_drop';
  containers: Array<{
    id: string;
    label: string;
    correctItems: string[]; 
  }>;
  draggableItems: Array<{
    id: string;
    label: string;
    imageUrl?: string;
  }>;
}

// Union type for all question variations
export type Question = 
  | MultipleChoiceQuestion 
  | ImageSelectionQuestion 
  | TrueFalseQuestion 
  | DragDropQuestion;

export interface UserProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number; // 0-100 percentage
  starsEarned: number; // 0-3 stars
  xpEarned: number;
  lastAttempted: string; // ISO date string
  attempts: number;
  bestScore?: number;
  masteryLevel?: number; // 0-1, represents concept mastery
  needsReview?: boolean;
}

export interface UserProfile {
  userId: string;
  nickname: string;
  avatarId: string;
  totalXp: number;
  currentLevel: number;
  totalStars: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface LevelInfo {
  level: number;
  title: string;
  badgeIcon: string;
  minXp: number;
  maxXp: number;
  progressPercent: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'milestone' | 'maths' | 'science' | 'mastery' | 'progress' | 'habit' | 'capstone';
  unlocked: boolean;
  unlockedAt?: string;
  xpBonus: number;
  popupHeadline: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name or URL
  criteria: {
    type: 'lessons_completed' | 'perfect_score' | 'streak' | 'subject_mastery' | 'questions_correct';
    target: number;
    subject?: Subject;
    moduleId?: string;
    lessonId?: string;
  };
  unlocked: boolean;
  unlockedAt?: string; // ISO date string
  earnedXp?: number;
}

export interface QuestionAttempt {
  id: string;
  userId: string;
  questionId: string;
  lessonId: string;
  selectedAnswer: any;
  isCorrect: boolean;
  timestamp: string;
  timeSpent: number;
}

export interface LessonCompletionResult {
  lessonId: string;
  score: number;
  starsEarned: number;
  xpEarned: number;
  isFirstCompletion: boolean;
  newlyUnlockedBadges: Badge[];
  isLevelUp: boolean;
  previousLevel: number;
  newLevel: LevelInfo;
}

