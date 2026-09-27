import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, UserProfile, Badge } from '../data/models';

const STORAGE_KEYS = {
  USER_PROGRESS: '@lwf_user_progress',
  USER_PROFILE: '@lwf_user_profile',
  USER_BADGES: '@lwf_user_badges',
};

// In-memory fallback in case native storage is unavailable (e.g. during certain test environments)
const memoryFallback: Record<string, string> = {};

const safeGetItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.warn(`[StorageService] AsyncStorage getItem failed for ${key}, using memory fallback:`, error);
    return memoryFallback[key] ?? null;
  }
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.warn(`[StorageService] AsyncStorage setItem failed for ${key}, using memory fallback:`, error);
  }
  memoryFallback[key] = value;
};

export const storageService = {
  async saveUserProgress(progress: UserProgress[]): Promise<void> {
    await safeSetItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
  },

  async loadUserProgress(): Promise<UserProgress[]> {
    const raw = await safeGetItem(STORAGE_KEYS.USER_PROGRESS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await safeSetItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  async loadUserProfile(): Promise<UserProfile | null> {
    const raw = await safeGetItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async saveBadges(badges: Badge[]): Promise<void> {
    await safeSetItem(STORAGE_KEYS.USER_BADGES, JSON.stringify(badges));
  },

  async loadBadges(): Promise<Badge[] | null> {
    const raw = await safeGetItem(STORAGE_KEYS.USER_BADGES);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_PROGRESS),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_BADGES),
      ]);
    } catch (e) {
      console.warn('[StorageService] Error clearing local storage:', e);
    }
    delete memoryFallback[STORAGE_KEYS.USER_PROGRESS];
    delete memoryFallback[STORAGE_KEYS.USER_PROFILE];
    delete memoryFallback[STORAGE_KEYS.USER_BADGES];
  },
};
