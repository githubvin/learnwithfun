import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useLearning } from '../../src/context/LearningContext';
import { useRouter } from 'expo-router';
import { ParentalGateModal } from '../../src/components/ParentalGateModal';
import { audioService } from '../../src/services/audioService';
import { getAvatarById } from '../../src/data/avatarsCatalog';
import { colors } from '../../src/theme/colors';

export default function SettingsScreen() {
  const {
    userProfile,
    userLevel,
    totalStars,
    userProgress,
    badges,
    lessons,
    resetAllProgress,
  } = useLearning();
  const router = useRouter();

  // Guard state with Parental Gate
  const [isGateUnlocked, setIsGateUnlocked] = useState<boolean>(false);

  // Audio settings states
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(() => audioService.getSettings().speechEnabled);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => audioService.getSettings().sfxEnabled);

  const currentAvatar = getAvatarById(userProfile.avatarId || 'lion');

  // Compute Learning Analytics
  const completedLessonsCount = useMemo(
    () => userProgress.filter(p => p.completed).length,
    [userProgress]
  );

  const averageAccuracy = useMemo(() => {
    const completed = userProgress.filter(p => p.completed);
    if (!completed.length) return 0;
    const totalScore = completed.reduce((sum, p) => sum + (p.bestScore || p.score || 0), 0);
    return Math.round(totalScore / completed.length);
  }, [userProgress]);

  const unlockedBadgesCount = useMemo(
    () => badges.filter(b => b.unlocked).length,
    [badges]
  );

  const handleToggleSpeech = (value: boolean) => {
    audioService.playTapSound();
    setSpeechEnabled(value);
    audioService.setSpeechEnabled(value);
  };

  const handleToggleSfx = (value: boolean) => {
    audioService.playTapSound();
    setSfxEnabled(value);
    audioService.setSfxEnabled(value);
  };

  const handleResetProgress = () => {
    audioService.playTapSound();
    Alert.alert(
      'Reset All Learning Progress?',
      'Are you sure you want to reset all earned stars, XP, badges, and lesson progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetAllProgress();
            Alert.alert('Reset Complete', 'All progress has been reset for a fresh learning journey!', [
              {
                text: 'OK',
                onPress: () => router.replace('/'),
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Parental Gate Modal (Blocks access until adult solves math question) */}
      <ParentalGateModal
        visible={!isGateUnlocked}
        onSuccess={() => setIsGateUnlocked(true)}
        onCancel={() => router.back()}
      />

      {isGateUnlocked && (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Parent Zone & Settings ⚙️</Text>
            <Text style={styles.headerSubtitle}>
              Learning progress analytics and app preferences
            </Text>
          </View>

          {/* Learner Progress Overview Card */}
          <View style={styles.sectionCard}>
            <View style={styles.profileSummaryRow}>
              <View style={[styles.avatarCircle, { backgroundColor: currentAvatar.bgColor }]}>
                <Text style={styles.avatarEmoji}>{currentAvatar.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.learnerName}>{userProfile.nickname}</Text>
                <Text style={styles.learnerRank}>
                  {userLevel.badgeIcon} Level {userLevel.level}: {userLevel.title}
                </Text>
              </View>
            </View>

            <View style={styles.analyticsGrid}>
              <View style={styles.analyticBox}>
                <Text style={styles.analyticValue}>
                  {completedLessonsCount} / {lessons.length}
                </Text>
                <Text style={styles.analyticLabel}>Quests Completed</Text>
              </View>

              <View style={styles.analyticBox}>
                <Text style={styles.analyticValue}>
                  ⭐ {totalStars} / 150
                </Text>
                <Text style={styles.analyticLabel}>Total Stars</Text>
              </View>

              <View style={styles.analyticBox}>
                <Text style={styles.analyticValue}>
                  {averageAccuracy}%
                </Text>
                <Text style={styles.analyticLabel}>Avg Accuracy</Text>
              </View>

              <View style={styles.analyticBox}>
                <Text style={styles.analyticValue}>
                  🏆 {unlockedBadgesCount} / 16
                </Text>
                <Text style={styles.analyticLabel}>Badges Earned</Text>
              </View>
            </View>
          </View>

          {/* Audio & Accessibility Controls */}
          <View style={styles.sectionCard}>
            <Text style={styles.cardHeading}>🔊 Audio & Narration</Text>
            <Text style={styles.cardSubheading}>
              Voice assistance for early Grade 2 readers
            </Text>

            <View style={styles.settingRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.settingLabel}>Voice Narration (Read to Me)</Text>
                <Text style={styles.settingDesc}>
                  Enables reading aloud questions and multiple-choice options
                </Text>
              </View>
              <Switch
                value={speechEnabled}
                onValueChange={handleToggleSpeech}
                trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                thumbColor={speechEnabled ? '#2563eb' : '#94a3b8'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.settingLabel}>Sound Effects & Chimes</Text>
                <Text style={styles.settingDesc}>
                  Play celebratory chimes, encouragement tones, and tap feedback
                </Text>
              </View>
              <Switch
                value={sfxEnabled}
                onValueChange={handleToggleSfx}
                trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                thumbColor={sfxEnabled ? '#2563eb' : '#94a3b8'}
              />
            </View>
          </View>

          {/* Danger Zone: Reset Progress */}
          <View style={[styles.sectionCard, styles.dangerCard]}>
            <Text style={styles.dangerHeading}>⚠️ Data Management</Text>
            <Text style={styles.dangerSubheading}>
              Reset all lesson records, stars, and trophies for a new learner
            </Text>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetProgress}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>Reset All Learning Progress</Text>
            </TouchableOpacity>
          </View>

          {/* App Information */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Learning With Fun</Text>
            <Text style={styles.infoText}>Version 1.0.0 (Grade 2 MVP1)</Text>
            <Text style={styles.infoBadge}>🛡️ COPPA Compliant • 100% Ad-Free • Kid-Safe</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
  },
  profileSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  learnerName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  learnerRank: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  analyticBox: {
    width: '48%',
    backgroundColor: colors.surfaceWarm,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  analyticValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  analyticLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cardHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardSubheading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 12,
  },
  dangerCard: {
    borderColor: colors.coralBorder,
    backgroundColor: colors.surface,
  },
  dangerHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.error,
    marginBottom: 2,
  },
  dangerSubheading: {
    fontSize: 13,
    color: colors.coralText,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: colors.error,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
    padding: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  infoBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.scienceText,
    backgroundColor: colors.scienceSoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
