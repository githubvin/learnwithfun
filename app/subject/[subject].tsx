import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLearning } from '../../src/context/LearningContext';
import {
  getModuleStats,
  getSubjectStats,
  getNextAvailableLesson,
} from '../../src/engines/progressionEngine';
import { Lesson, Subject } from '../../src/data/models';
import { colors } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

export default function SubjectAdventureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ subject?: string }>();
  const rawSubject = params.subject === 'science' ? 'science' : 'maths';
  const activeSubject: Subject = rawSubject;

  const { lessons, modules, userProgress, totalStars, userLevel } = useLearning();

  // State to track expanded module cards
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [`${activeSubject}-m1`]: true,
    [`${activeSubject}-s1`]: true,
  });

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Filter modules and lessons for active subject
  const subjectModules = modules
    .filter(m => m.subject === activeSubject)
    .sort((a, b) => a.order - b.order);

  const subjectLessons = lessons.filter(l => l.moduleId.startsWith(activeSubject));

  // Compute subject level stats
  const subjectStats = getSubjectStats(
    activeSubject,
    subjectModules,
    subjectLessons,
    userProgress,
    totalStars
  );

  // Determine next recommended lesson
  const nextLesson = getNextAvailableLesson(subjectLessons, userProgress, totalStars);

  const isMaths = activeSubject === 'maths';
  const theme = {
    primary: isMaths ? colors.mathsPrimary : colors.sciencePrimary,
    primaryDark: isMaths ? colors.mathsText : colors.scienceText,
    primaryLight: isMaths ? colors.mathsSoft : colors.scienceSoft,
    accent: isMaths ? colors.primary : colors.sciencePrimary,
    badge: isMaths ? '📘' : '🔬',
    title: isMaths ? 'Maths Kingdom' : 'Science Safari',
    subtitle: isMaths
      ? 'Numbers, Addition, Shapes & Measurement'
      : 'Living Things, Plants, Animals & Matter',
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Header Card */}
        <View style={[styles.headerCard, { backgroundColor: theme.primary }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.backButtonText}>← Adventure Map</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleRow}>
            <View style={styles.headerTextCol}>
              <Text style={styles.subjectPreTitle}>{theme.badge} GRADE 2 ADVENTURE</Text>
              <Text style={styles.subjectTitle}>{theme.title}</Text>
              <Text style={styles.subjectSubtitle}>{theme.subtitle}</Text>
            </View>
            <View style={styles.starsBadge}>
              <Text style={styles.starsBadgeText}>⭐ {subjectStats.totalStarsEarned}</Text>
              <Text style={styles.starsBadgeSub}>of {subjectStats.maxStars}</Text>
            </View>
          </View>

          {/* Subject Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.max(subjectStats.progressPercent, 4)}%` },
                ]}
              />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>
                {subjectStats.completedLessonsCount} of {subjectStats.totalLessonsCount} Lessons Cleared
              </Text>
              <Text style={styles.progressPercent}>{subjectStats.progressPercent}%</Text>
            </View>
          </View>
        </View>

        {/* Quick Start / Continue Banner */}
        {nextLesson && (
          <TouchableOpacity
            style={styles.continueCard}
            onPress={() => router.push(`/lesson/${nextLesson.id}` as any)}
            activeOpacity={0.85}
          >
            <View style={styles.continueIconContainer}>
              <Text style={styles.continueIcon}>🚀</Text>
            </View>
            <View style={styles.continueInfo}>
              <Text style={styles.continueTag}>NEXT QUEST READY</Text>
              <Text style={styles.continueTitle}>{nextLesson.title}</Text>
              <Text style={styles.continueDesc}>{nextLesson.description}</Text>
            </View>
            <Text style={styles.continueArrow}>➔</Text>
          </TouchableOpacity>
        )}

        {/* Modules Stepping Stone Trail */}
        <View style={styles.trailContainer}>
          <Text style={styles.trailHeader}>🗺️ Module Journey Trail</Text>
          <Text style={styles.trailSubheader}>
            Unlock worlds step-by-step by earning stars across your adventures!
          </Text>

          {subjectModules.map((module, index) => {
            const moduleLessons = subjectLessons
              .filter(l => l.moduleId === module.id)
              .sort((a, b) => a.order - b.order);

            const stats = getModuleStats(module.id, moduleLessons, userProgress, totalStars);
            const isExpanded = !!expandedModules[module.id];
            const isLast = index === subjectModules.length - 1;

            return (
              <View key={module.id} style={styles.stageWrapper}>
                {/* Visual Trail Connector Line */}
                {!isLast && (
                  <View
                    style={[
                      styles.connectorLine,
                      stats.isUnlocked ? styles.connectorUnlocked : styles.connectorLocked,
                    ]}
                  />
                )}

                {/* Module Card */}
                <View
                  style={[
                    styles.moduleCard,
                    stats.isUnlocked ? styles.moduleCardUnlocked : styles.moduleCardLocked,
                  ]}
                >
                  {/* Module Header Bar */}
                  <TouchableOpacity
                    style={styles.moduleHeaderTouch}
                    onPress={() => stats.isUnlocked && toggleModuleExpand(module.id)}
                    activeOpacity={stats.isUnlocked ? 0.8 : 1}
                  >
                    <View style={styles.moduleHeaderLeft}>
                      <View
                        style={[
                          styles.stagePill,
                          stats.isUnlocked
                            ? { backgroundColor: theme.primary }
                            : styles.stagePillLocked,
                        ]}
                      >
                        <Text style={styles.stagePillText}>Stage {index + 1}</Text>
                      </View>
                      <Text style={styles.moduleTitle}>{module.title}</Text>
                      <Text style={styles.moduleDescription}>{module.description}</Text>
                    </View>

                    <View style={styles.moduleHeaderRight}>
                      {stats.isUnlocked ? (
                        <View style={styles.unlockedBadge}>
                          <Text style={styles.unlockedBadgeStars}>
                            ⭐ {stats.totalStarsEarned}/{stats.maxStars}
                          </Text>
                          <Text style={styles.expandChevron}>{isExpanded ? '▲' : '▼'}</Text>
                        </View>
                      ) : (
                        <View style={styles.lockedBadge}>
                          <Text style={styles.lockedBadgeText}>🔒 Locked</Text>
                          <Text style={styles.lockedBadgeSub}>
                            Needs {module.requiredStarsToUnlock} ⭐
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Locked Guidance Hint */}
                  {!stats.isUnlocked && (
                    <View style={styles.lockedBanner}>
                      <Text style={styles.lockedBannerText}>
                        ✨ Earn {stats.starsNeededToUnlock} more ⭐ anywhere in the app to unlock this world!
                      </Text>
                    </View>
                  )}

                  {/* Expanded Lessons Drawer */}
                  {stats.isUnlocked && isExpanded && (
                    <View style={styles.lessonsDrawer}>
                      <View style={styles.drawerDivider} />
                      {moduleLessons.map((lesson, lessonIdx) => {
                        const progress = userProgress.find(p => p.lessonId === lesson.id);
                        const isDone = progress?.completed ?? false;
                        const starsEarned = progress?.starsEarned ?? 0;

                        return (
                          <TouchableOpacity
                            key={lesson.id}
                            style={[
                              styles.lessonRow,
                              isDone && styles.lessonRowDone,
                            ]}
                            onPress={() => router.push(`/lesson/${lesson.id}` as any)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.lessonOrderCircle}>
                              <Text style={styles.lessonOrderNum}>{lessonIdx + 1}</Text>
                            </View>

                            <View style={styles.lessonInfoCol}>
                              <Text style={styles.lessonRowTitle}>{lesson.title}</Text>
                              <Text style={styles.lessonRowDesc}>
                                ⏱️ {Math.floor(lesson.estimatedDuration / 60)} min •{' '}
                                {isDone ? `Score: ${progress?.bestScore ?? progress?.score}%` : 'Not started'}
                              </Text>
                            </View>

                            <View style={styles.lessonStatusRight}>
                              {isDone ? (
                                <Text style={styles.lessonStarsEarned}>
                                  {'⭐'.repeat(starsEarned || 1)}
                                </Text>
                              ) : (
                                <View style={[styles.playButton, { backgroundColor: theme.primary }]}>
                                  <Text style={styles.playButtonText}>Start ➔</Text>
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerCard: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  backButton: {
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 12,
  },
  subjectPreTitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subjectTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  subjectSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginTop: 3,
  },
  starsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  starsBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  starsBadgeSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FDE047',
    borderRadius: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  progressPercent: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  continueCard: {
    marginHorizontal: 18,
    marginTop: -14,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
  },
  continueIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.sunshineSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  continueIcon: {
    fontSize: 24,
  },
  continueInfo: {
    flex: 1,
  },
  continueTag: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.sunshineGold,
    letterSpacing: 0.5,
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  continueDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  continueArrow: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
    marginLeft: 8,
  },
  trailContainer: {
    paddingHorizontal: 18,
    marginTop: 24,
  },
  trailHeader: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  trailSubheader: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 18,
  },
  stageWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  connectorLine: {
    position: 'absolute',
    left: 28,
    top: 50,
    bottom: -20,
    width: 4,
    zIndex: -1,
  },
  connectorUnlocked: {
    backgroundColor: colors.borderSubtle,
  },
  connectorLocked: {
    backgroundColor: colors.borderSubtle,
  },
  moduleCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  moduleCardUnlocked: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
  },
  moduleCardLocked: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.borderSubtle,
    opacity: 0.85,
  },
  moduleHeaderTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  stagePill: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  stagePillLocked: {
    backgroundColor: '#94A3B8',
  },
  stagePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  moduleDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  moduleHeaderRight: {
    alignItems: 'flex-end',
  },
  unlockedBadge: {
    alignItems: 'flex-end',
  },
  unlockedBadgeStars: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.sunshineGold,
  },
  expandChevron: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  lockedBadge: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  lockedBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  lockedBadgeSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lockedBanner: {
    marginTop: 12,
    backgroundColor: colors.sunshineSoft,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.sunshineBorder,
  },
  lockedBannerText: {
    fontSize: 12,
    color: colors.sunshineGold,
    fontWeight: '600',
  },
  lessonsDrawer: {
    marginTop: 12,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginBottom: 10,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: colors.surfaceWarm,
  },
  lessonRowDone: {
    backgroundColor: colors.scienceSoft,
  },
  lessonOrderCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  lessonOrderNum: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  lessonInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  lessonRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  lessonRowDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lessonStatusRight: {
    alignItems: 'flex-end',
  },
  lessonStarsEarned: {
    fontSize: 14,
  },
  playButton: {
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
