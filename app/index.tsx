import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLearning } from '../src/context/LearningContext';
import { useRouter } from 'expo-router';
import { Lesson } from '../src/data/models';
import { getSubjectStats } from '../src/engines/progressionEngine';
import { getAvatarById } from '../src/data/avatarsCatalog';
import { colors } from '../src/theme/colors';

export default function HomeScreen() {
  const { lessons, modules, userProfile, userLevel, totalStars, userProgress, badges } = useLearning();
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'maths' | 'science'>('all');

  const filteredLessons = lessons.filter(lesson => {
    if (selectedSubject === 'all') return true;
    return lesson.moduleId.startsWith(selectedSubject);
  });

  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;

  const mathsModules = useMemo(() => modules.filter(m => m.subject === 'maths'), [modules]);
  const scienceModules = useMemo(() => modules.filter(m => m.subject === 'science'), [modules]);
  const mathsLessons = useMemo(() => lessons.filter(l => l.moduleId.startsWith('maths')), [lessons]);
  const scienceLessons = useMemo(() => lessons.filter(l => l.moduleId.startsWith('science')), [lessons]);

  const mathsStats = useMemo(
    () => getSubjectStats('maths', mathsModules, mathsLessons, userProgress, totalStars),
    [mathsModules, mathsLessons, userProgress, totalStars]
  );

  const scienceStats = useMemo(
    () => getSubjectStats('science', scienceModules, scienceLessons, userProgress, totalStars),
    [scienceModules, scienceLessons, userProgress, totalStars]
  );

  const currentAvatar = getAvatarById(userProfile.avatarId || 'lion');

  const renderHeader = () => (
    <View style={styles.adventureSection}>
      {/* Adventure Worlds Title */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🗺️ Choose Your Adventure</Text>
        <Text style={styles.sectionSubtitle}>Explore stepping-stone module maps</Text>
      </View>

      {/* 2-Card Adventure Grid */}
      <View style={styles.adventureCardsContainer}>
        {/* Maths Kingdom Card */}
        <TouchableOpacity
          style={[styles.adventureCard, styles.mathsCardBg]}
          onPress={() => router.push('/subject/maths' as any)}
          activeOpacity={0.88}
        >
          <View style={styles.adventureCardTop}>
            <Text style={styles.adventureCardIcon}>🏰</Text>
            <View style={styles.badgePillMaths}>
              <Text style={styles.badgePillTextMaths}>{mathsStats.progressPercent}% DONE</Text>
            </View>
          </View>

          <Text style={styles.adventureTitle}>Maths Kingdom</Text>
          <Text style={styles.adventureDesc}>Numbers, shapes & space adventures</Text>

          <View style={styles.adventureProgressTrack}>
            <View style={[styles.adventureProgressFillMaths, { width: `${mathsStats.progressPercent}%` }]} />
          </View>

          <View style={styles.adventureStatsRow}>
            <Text style={styles.adventureStatText}>⭐ {mathsStats.totalStarsEarned}/75</Text>
            <Text style={styles.adventureStatText}>🎯 {mathsStats.completedLessonsCount}/25</Text>
          </View>

          <View style={styles.adventureCtaRow}>
            <Text style={styles.adventureCtaMaths}>Enter Trail ➔</Text>
          </View>
        </TouchableOpacity>

        {/* Science Safari Card */}
        <TouchableOpacity
          style={[styles.adventureCard, styles.scienceCardBg]}
          onPress={() => router.push('/subject/science' as any)}
          activeOpacity={0.88}
        >
          <View style={styles.adventureCardTop}>
            <Text style={styles.adventureCardIcon}>🌿</Text>
            <View style={styles.badgePillScience}>
              <Text style={styles.badgePillTextScience}>{scienceStats.progressPercent}% DONE</Text>
            </View>
          </View>

          <Text style={styles.adventureTitle}>Science Safari</Text>
          <Text style={styles.adventureDesc}>Living things, weather & forces</Text>

          <View style={styles.adventureProgressTrack}>
            <View style={[styles.adventureProgressFillScience, { width: `${scienceStats.progressPercent}%` }]} />
          </View>

          <View style={styles.adventureStatsRow}>
            <Text style={styles.adventureStatText}>⭐ {scienceStats.totalStarsEarned}/75</Text>
            <Text style={styles.adventureStatText}>🎯 {scienceStats.completedLessonsCount}/25</Text>
          </View>

          <View style={styles.adventureCtaRow}>
            <Text style={styles.adventureCtaScience}>Enter Trail ➔</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Trail Jump if filtered */}
      {selectedSubject !== 'all' && (
        <TouchableOpacity
          style={[
            styles.quickTrailBanner,
            selectedSubject === 'maths' ? styles.quickTrailBannerMaths : styles.quickTrailBannerScience,
          ]}
          onPress={() => router.push(`/subject/${selectedSubject}` as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.quickTrailIcon}>🗺️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickTrailTitle}>
              Open {selectedSubject === 'maths' ? 'Maths Kingdom' : 'Science Safari'} Map
            </Text>
            <Text style={styles.quickTrailSubtitle}>Follow the interactive stepping-stone path</Text>
          </View>
          <Text style={styles.quickTrailArrow}>➔</Text>
        </TouchableOpacity>
      )}

      {/* Section header for lessons */}
      <View style={styles.lessonsHeaderRow}>
        <Text style={styles.sectionTitle}>
          {selectedSubject === 'all'
            ? '📚 All Lessons'
            : selectedSubject === 'maths'
            ? '📘 Maths Lessons'
            : '🔬 Science Lessons'}
        </Text>
        <Text style={styles.lessonsCountBadge}>{filteredLessons.length} available</Text>
      </View>
    </View>
  );

  const renderLessonItem = ({ item }: { item: Lesson }) => {
    const progress = userProgress.find(p => p.lessonId === item.id);
    const isCompleted = progress?.completed ?? false;
    const starsEarned = progress?.starsEarned ?? 0;
    const isMaths = item.moduleId.startsWith('maths');

    return (
      <TouchableOpacity
        style={styles.lessonCard}
        onPress={() => {
          router.push(`/lesson/${item.id}` as any);
        }}
        activeOpacity={0.85}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.subjectTag, isMaths ? styles.mathsTag : styles.scienceTag]}>
              {isMaths ? '📘 MATHS' : '🔬 SCIENCE'}
            </Text>
            {isCompleted && (
              <View style={styles.starContainer}>
                <Text style={styles.starText}>{'⭐'.repeat(starsEarned || 1)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.lessonTitle}>{item.title}</Text>
          <Text style={styles.lessonDescription}>{item.description}</Text>

          <View style={styles.cardFooter}>
            <Text style={styles.duration}>⏱️ {Math.floor(item.estimatedDuration / 60)} min</Text>
            <Text style={styles.progressStatus}>
              {isCompleted ? `✅ Best: ${progress?.bestScore ?? progress?.score}%` : '🚀 Ready to Start'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header / Profile Bar */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <TouchableOpacity
            style={styles.profileGreetingButton}
            onPress={() => router.push('/profile' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarMiniCircle}>
              <Text style={styles.avatarMiniEmoji}>{currentAvatar.emoji}</Text>
            </View>
            <View>
              <Text style={styles.appTitle}>Learning With Fun</Text>
              <Text style={styles.learnerGreeting}>
                Hello, {userProfile.nickname}! ✏️
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.trophyButton}
            onPress={() => router.push('/badges' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.trophyIcon}>🏆</Text>
            <Text style={styles.trophyCount}>{unlockedBadgesCount}/16</Text>
          </TouchableOpacity>
        </View>

        {/* Level & Star Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {userLevel.badgeIcon} Level {userLevel.level}
            </Text>
            <Text style={styles.statLabel}>{userLevel.title}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {totalStars}</Text>
            <Text style={styles.statLabel}>Total Stars</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>⚡ {userProfile.totalXp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>

        {/* Level Progress Bar */}
        <View style={styles.levelProgressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${userLevel.progressPercent}%` }]} />
          </View>
          <Text style={styles.progressPercentText}>{userLevel.progressPercent}% to next rank</Text>
        </View>
      </View>

      {/* Subject Filter Pills */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterChip, selectedSubject === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedSubject('all')}
        >
          <Text style={[styles.filterText, selectedSubject === 'all' && styles.filterTextActive]}>
            🌟 All ({lessons.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedSubject === 'maths' && styles.filterChipActiveMaths]}
          onPress={() => setSelectedSubject('maths')}
        >
          <Text style={[styles.filterText, selectedSubject === 'maths' && styles.filterTextActive]}>
            📘 Maths (25)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedSubject === 'science' && styles.filterChipActiveScience]}
          onPress={() => setSelectedSubject('science')}
        >
          <Text style={[styles.filterText, selectedSubject === 'science' && styles.filterTextActive]}>
            🔬 Science (25)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lessons List with Adventure Trail Header */}
      <FlatList
        data={filteredLessons}
        keyExtractor={item => item.id}
        renderItem={renderLessonItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileGreetingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarMiniCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarMiniEmoji: {
    fontSize: 24,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  learnerGreeting: {
    fontSize: 14,
    color: '#e0e7ff',
    fontWeight: '600',
    marginTop: 2,
  },
  trophyButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  trophyIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  trophyCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textHead,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textHead,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textBody,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderDivider,
  },
  levelProgressContainer: {
    marginTop: 14,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.starYellow,
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 11,
    color: '#e0e7ff',
    textAlign: 'right',
    marginTop: 4,
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.textHead,
  },
  filterChipActiveMaths: {
    backgroundColor: colors.mathsPrimary,
  },
  filterChipActiveScience: {
    backgroundColor: colors.sciencePrimary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textBody,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  adventureSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textHead,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textBody,
    marginTop: 2,
  },
  adventureCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  adventureCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mathsCardBg: {
    backgroundColor: colors.mathsSoft,
    borderColor: colors.mathsBorder,
  },
  scienceCardBg: {
    backgroundColor: colors.scienceSoft,
    borderColor: colors.scienceBorder,
  },
  adventureCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adventureCardIcon: {
    fontSize: 28,
  },
  badgePillMaths: {
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgePillTextMaths: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.mathsText,
  },
  badgePillScience: {
    backgroundColor: '#d1fae5',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgePillTextScience: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.scienceText,
  },
  adventureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textHead,
    marginBottom: 2,
  },
  adventureDesc: {
    fontSize: 11,
    color: colors.textBody,
    lineHeight: 15,
    marginBottom: 10,
  },
  adventureProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  adventureProgressFillMaths: {
    height: '100%',
    backgroundColor: colors.mathsPrimary,
    borderRadius: 3,
  },
  adventureProgressFillScience: {
    height: '100%',
    backgroundColor: colors.sciencePrimary,
    borderRadius: 3,
  },
  adventureStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  adventureStatText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textBody,
  },
  adventureCtaRow: {
    alignItems: 'flex-end',
  },
  adventureCtaMaths: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.mathsText,
  },
  adventureCtaScience: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.scienceText,
  },
  quickTrailBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  quickTrailBannerMaths: {
    backgroundColor: colors.mathsSoft,
    borderColor: colors.mathsBorder,
  },
  quickTrailBannerScience: {
    backgroundColor: colors.scienceSoft,
    borderColor: colors.scienceBorder,
  },
  quickTrailIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  quickTrailTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textHead,
  },
  quickTrailSubtitle: {
    fontSize: 11,
    color: colors.textBody,
    marginTop: 1,
  },
  quickTrailArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textHead,
    marginLeft: 8,
  },
  lessonsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 6,
  },
  lessonsCountBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textBody,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lessonCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectTag: {
    fontSize: 11,
    fontWeight: '800',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  mathsTag: {
    backgroundColor: colors.mathsSoft,
    color: colors.mathsText,
  },
  scienceTag: {
    backgroundColor: colors.scienceSoft,
    color: colors.scienceText,
  },
  starContainer: {
    flexDirection: 'row',
  },
  starText: {
    fontSize: 14,
  },
  lessonTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textHead,
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 13,
    color: colors.textBody,
    marginBottom: 12,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderDivider,
    paddingTop: 10,
  },
  duration: {
    fontSize: 13,
    color: colors.scienceText,
    fontWeight: '700',
  },
  progressStatus: {
    fontSize: 13,
    color: colors.textBody,
    fontWeight: '600',
  },
});
