import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Lesson,
  Question,
  Subject,
  Module,
  UserProgress,
  Badge,
  UserProfile,
  LevelInfo,
  LessonCompletionResult,
} from '../data/models';
import {
  subjects,
  allModules as modulesData,
  lessons as lessonsData,
  questions as questionsData,
  initialUserProgress,
  initialUserProfile,
} from '../data/sampleData';
import { initialBadgesCatalog } from '../data/badgesCatalog';
import {
  calculateStars,
  calculateLessonXp,
  calculateUserLevel,
  isModuleUnlocked,
} from '../engines/progressionEngine';
import { evaluateBadges } from '../engines/badgeEvaluator';
import { storageService } from '../services/storageService';
import {
  initializeFirebase,
  getAuthService,
  signInAnonymouslyUser,
  onAuthStateChange,
  getUserProgressDocRef,
  updateDocument,
} from '../services/firebase';

// Define the context type
interface LearningContextType {
  // Data
  lessons: Lesson[];
  questions: Record<string, Question[]>; // lessonId -> questions
  modules: Module[];
  subjects: Subject[];

  // User State
  userProgress: UserProgress[];
  badges: Badge[];
  userProfile: UserProfile;
  userLevel: LevelInfo;
  totalStars: number;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  markLessonComplete: (score: number, lessonIdOverride?: string) => Promise<LessonCompletionResult | null>;
  getLessonProgress: (lessonId: string) => UserProgress | undefined;
  isModuleAccessible: (moduleId: string) => boolean;
  getBadges: () => Badge[];
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetAllProgress: () => Promise<void>;
}

// Create context
const LearningContext = createContext<LearningContextType | null>(null);

// Custom hook to use the context
export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

const buildInitialQuestionsMap = (): Record<string, Question[]> => {
  const map: Record<string, Question[]> = {};
  questionsData.forEach(question => {
    if (!map[question.lessonId]) {
      map[question.lessonId] = [];
    }
    map[question.lessonId].push(question);
  });
  return map;
};

// Provider component
export const LearningProvider = ({ children }: { children: React.ReactNode }) => {
  const [questionsMap] = useState<Record<string, Question[]>>(buildInitialQuestionsMap);
  const [lessons] = useState<Lesson[]>(lessonsData);
  const [modules] = useState<Module[]>(modulesData);
  const [subjectsState] = useState<Subject[]>(subjects);

  // User Progress and Gamification States
  const [userProgress, setUserProgress] = useState<UserProgress[]>(initialUserProgress);
  const [badges, setBadges] = useState<Badge[]>(initialBadgesCatalog);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);

  // System & Auth States
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Compute Total Stars
  const totalStars = useMemo(() => {
    return userProgress.reduce((sum, p) => sum + (p.starsEarned || 0), 0);
  }, [userProgress]);

  // Compute Current User Level Info
  const userLevel = useMemo(() => {
    return calculateUserLevel(userProfile.totalXp);
  }, [userProfile.totalXp]);

  // Load Initial Local Storage Data
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cachedProgress = await storageService.loadUserProgress();
        if (cachedProgress && cachedProgress.length > 0) {
          setUserProgress(cachedProgress);
        }

        const cachedProfile = await storageService.loadUserProfile();
        if (cachedProfile) {
          setUserProfile(cachedProfile);
        }

        const cachedBadges = await storageService.loadBadges();
        if (cachedBadges && cachedBadges.length > 0) {
          setBadges(cachedBadges);
        }
      } catch (err) {
        console.warn('[LearningContext] Error loading cached data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCachedData();
  }, []);

  // Initialize Firebase (Optional Background Auth)
  useEffect(() => {
    try {
      initializeFirebase();
      const auth = getAuthService();
      const unsubscribe = onAuthStateChange(async (user) => {
        if (user) {
          setUserId(user.uid);
          setIsAuthenticated(true);
        } else {
          try {
            const anonUser = await signInAnonymouslyUser();
            setUserId(anonUser.uid);
            setIsAuthenticated(true);
          } catch (e) {
            console.log('[LearningContext] Anonymous sign-in skipped, continuing offline:', e);
          }
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.log('[LearningContext] Firebase initialization skipped, running offline mode:', e);
    }
  }, []);

  // Get progress for a specific lesson
  const getLessonProgress = useCallback(
    (lessonId: string): UserProgress | undefined => {
      return userProgress.find(progress => progress.lessonId === lessonId);
    },
    [userProgress]
  );

  // Check if a module is accessible based on stars earned
  const isModuleAccessible = useCallback(
    (moduleId: string): boolean => {
      return isModuleUnlocked(moduleId, totalStars);
    },
    [totalStars]
  );

  // Return all badges
  const getBadges = useCallback(() => {
    return badges;
  }, [badges]);

  // Mark lesson as complete, calculate rewards, and evaluate badges
  const handleMarkLessonComplete = useCallback(
    async (score: number, lessonIdOverride?: string): Promise<LessonCompletionResult | null> => {
      const activeLessonId = lessonIdOverride;
      if (!activeLessonId) return null;

      const starsEarned = calculateStars(score);
      const isFirst = !userProgress.some(p => p.lessonId === activeLessonId && p.completed);
      const xpEarned = calculateLessonXp(score, isFirst);

      // 1. Update Progress Entry
      const existingIndex = userProgress.findIndex(p => p.lessonId === activeLessonId);
      const prevAttempts = existingIndex >= 0 ? userProgress[existingIndex].attempts : 0;
      const prevBest = existingIndex >= 0 ? (userProgress[existingIndex].bestScore ?? 0) : 0;

      const newEntry: UserProgress = {
        userId: userId || userProfile.userId,
        lessonId: activeLessonId,
        completed: score >= 50,
        score,
        starsEarned: Math.max(starsEarned, existingIndex >= 0 ? userProgress[existingIndex].starsEarned : 0),
        xpEarned,
        lastAttempted: new Date().toISOString(),
        attempts: prevAttempts + 1,
        bestScore: Math.max(score, prevBest),
      };

      let updatedProgress: UserProgress[];
      if (existingIndex >= 0) {
        updatedProgress = [...userProgress];
        updatedProgress[existingIndex] = newEntry;
      } else {
        updatedProgress = [...userProgress, newEntry];
      }

      setUserProgress(updatedProgress);
      await storageService.saveUserProgress(updatedProgress);

      // 2. Evaluate Badges & Level
      const newTotalStars = updatedProgress.reduce((sum, p) => sum + (p.starsEarned || 0), 0);
      const preliminaryXp = userProfile.totalXp + xpEarned;
      const preliminaryLevel = calculateUserLevel(preliminaryXp);

      const badgeEval = evaluateBadges({
        allBadges: badges,
        userProgress: updatedProgress,
        totalStars: newTotalStars,
        totalXp: preliminaryXp,
        currentLevel: preliminaryLevel.level,
        streakDays: userProfile.streakDays,
        latestScore: score,
      });

      if (badgeEval.newlyUnlocked.length > 0) {
        setBadges(badgeEval.updatedBadges);
        await storageService.saveBadges(badgeEval.updatedBadges);
      }

      // 3. Update User Profile
      const finalXp = preliminaryXp + badgeEval.totalBonusXp;
      const finalLevel = calculateUserLevel(finalXp);
      const previousLevel = userProfile.currentLevel;
      const isLevelUp = finalLevel.level > previousLevel;

      const updatedProfile: UserProfile = {
        ...userProfile,
        totalXp: finalXp,
        currentLevel: finalLevel.level,
        totalStars: newTotalStars,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };

      setUserProfile(updatedProfile);
      await storageService.saveUserProfile(updatedProfile);

      // 4. Background Sync to Firebase if authenticated
      if (isAuthenticated && userId) {
        try {
          const docRef = getUserProgressDocRef(userId, activeLessonId);
          await updateDocument(docRef, newEntry);
        } catch (e) {
          console.warn('[LearningContext] Remote sync failed, cached locally:', e);
        }
      }

      // 5. Construct and return completion result for CelebrationModal
      const result: LessonCompletionResult = {
        lessonId: activeLessonId,
        score,
        starsEarned,
        xpEarned: xpEarned + badgeEval.totalBonusXp,
        isFirstCompletion: isFirst,
        newlyUnlockedBadges: badgeEval.newlyUnlocked,
        isLevelUp,
        previousLevel,
        newLevel: finalLevel,
      };

      return result;
    },
    [userProgress, userProfile, badges, userId, isAuthenticated]
  );

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      storageService.saveUserProfile(updated).catch(e => {
        console.warn('[LearningContext] Error saving profile update:', e);
      });
      return updated;
    });
  }, []);

  const resetAllProgress = useCallback(async () => {
    await storageService.clearAll();
    setUserProgress([]);
    setBadges(initialBadgesCatalog);
    setUserProfile(initialUserProfile);
  }, []);

  const value = {
    lessons,
    questions: questionsMap,
    modules,
    subjects: subjectsState,

    userProgress,
    badges,
    userProfile,
    userLevel,
    totalStars,
    userId,
    isAuthenticated,
    isLoading,

    markLessonComplete: handleMarkLessonComplete,
    getLessonProgress,
    isModuleAccessible,
    getBadges,
    updateUserProfile,
    resetAllProgress,
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
};