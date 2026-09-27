import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LessonCompletionResult } from '../data/models';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export interface CelebrationModalProps {
  visible: boolean;
  result: LessonCompletionResult | null;
  onNextLesson: () => void;
  onGoHome: () => void;
  hasNextLesson?: boolean;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  result,
  onNextLesson,
  onGoHome,
  hasNextLesson = true,
}) => {
  // Animation drivers
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.7)).current;
  const star1Scale = useRef(new Animated.Value(0)).current;
  const star2Scale = useRef(new Animated.Value(0)).current;
  const star3Scale = useRef(new Animated.Value(0)).current;
  const xpBadgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && result) {
      // Reset values
      backdropAnim.setValue(0);
      cardScaleAnim.setValue(0.7);
      star1Scale.setValue(0);
      star2Scale.setValue(0);
      star3Scale.setValue(0);
      xpBadgeAnim.setValue(0);

      // Sequence animations
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(cardScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Stagger star animations
        const starAnimations = [];

        if (result.starsEarned >= 1) {
          starAnimations.push(
            Animated.spring(star1Scale, {
              toValue: 1,
              friction: 4,
              tension: 100,
              useNativeDriver: true,
            })
          );
        }
        if (result.starsEarned >= 2) {
          starAnimations.push(
            Animated.spring(star2Scale, {
              toValue: 1,
              friction: 4,
              tension: 100,
              useNativeDriver: true,
            })
          );
        }
        if (result.starsEarned >= 3) {
          starAnimations.push(
            Animated.spring(star3Scale, {
              toValue: 1,
              friction: 4,
              tension: 100,
              useNativeDriver: true,
            })
          );
        }

        starAnimations.push(
          Animated.spring(xpBadgeAnim, {
            toValue: 1,
            friction: 5,
            tension: 70,
            useNativeDriver: true,
          })
        );

        Animated.stagger(180, starAnimations).start();
      });
    }
  }, [visible, result]);

  if (!result) return null;

  const starsEarned = result.starsEarned;

  // Headline based on performance
  let headline = '👏 GOOD EFFORT!';
  let subheadline = 'Lesson Completed! Keep practicing to earn more stars!';
  if (starsEarned === 3) {
    headline = '🏆 SPECTACULAR! 🏆';
    subheadline = 'Perfect Mastery! You solved all questions like a champ!';
  } else if (starsEarned === 2) {
    headline = '🎉 GREAT JOB! 🎉';
    subheadline = 'Super smart! You demonstrated great knowledge!';
  } else if (starsEarned === 1) {
    headline = '⭐ YOU DID IT! ⭐';
    subheadline = 'Great job finishing the quest! Practice makes perfect!';
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onGoHome}>
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: cardScaleAnim }] }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Top Confetti & Header */}
            <Text style={styles.celebrationEmoji}>
              {starsEarned === 3 ? '🥳 ✨ 🌟' : starsEarned >= 1 ? '🎉 🎈 ✨' : '🌱 💧 ☀️'}
            </Text>
            <Text style={styles.headline}>{headline}</Text>
            <Text style={styles.subheadline}>{subheadline}</Text>

            {/* Animated Stars Tray */}
            <View style={styles.starsContainer}>
              {/* Star 1 */}
              <Animated.View
                style={[
                  styles.starSlot,
                  starsEarned >= 1 && { transform: [{ scale: star1Scale }] },
                ]}
              >
                <Text style={starsEarned >= 1 ? styles.starFilled : styles.starEmpty}>
                  {starsEarned >= 1 ? '⭐' : '☆'}
                </Text>
              </Animated.View>

              {/* Star 2 (Middle is slightly larger) */}
              <Animated.View
                style={[
                  styles.starSlot,
                  styles.starSlotMiddle,
                  starsEarned >= 2 && { transform: [{ scale: star2Scale }] },
                ]}
              >
                <Text
                  style={[
                    starsEarned >= 2 ? styles.starFilled : styles.starEmpty,
                    styles.starMiddleText,
                  ]}
                >
                  {starsEarned >= 2 ? '⭐' : '☆'}
                </Text>
              </Animated.View>

              {/* Star 3 */}
              <Animated.View
                style={[
                  styles.starSlot,
                  starsEarned >= 3 && { transform: [{ scale: star3Scale }] },
                ]}
              >
                <Text style={starsEarned >= 3 ? styles.starFilled : styles.starEmpty}>
                  {starsEarned >= 3 ? '⭐' : '☆'}
                </Text>
              </Animated.View>
            </View>

            {/* Score & XP Rewards Pill */}
            <Animated.View
              style={[
                styles.rewardPill,
                { transform: [{ scale: xpBadgeAnim }] },
              ]}
            >
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Score:</Text>
                <Text style={styles.scoreValue}>{result.score}%</Text>
              </View>

              <View style={styles.xpDivider} />

              <View style={styles.xpRow}>
                <Text style={styles.xpGained}>+{result.xpEarned} XP</Text>
                {result.isFirstCompletion && (
                  <View style={styles.firstTimeBadge}>
                    <Text style={styles.firstTimeText}>⚡ 20% First-Time Bonus!</Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Level-Up Banner (if applicable) */}
            {result.isLevelUp && (
              <View style={styles.levelUpCard}>
                <Text style={styles.levelUpEmoji}>🚀 🎖️ 👑</Text>
                <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
                <Text style={styles.levelUpSubtitle}>
                  You advanced to Level {result.newLevel.level}:{' '}
                  <Text style={styles.levelUpHighlight}>
                    {result.newLevel.badgeIcon} {result.newLevel.title}
                  </Text>
                </Text>
              </View>
            )}

            {/* Newly Unlocked Badges (if applicable) */}
            {result.newlyUnlockedBadges && result.newlyUnlockedBadges.length > 0 && (
              <View style={styles.badgeSection}>
                <Text style={styles.badgeSectionTitle}>🏆 NEW BADGE UNLOCKED!</Text>
                {result.newlyUnlockedBadges.map((badge) => (
                  <View key={badge.id} style={styles.badgeCard}>
                    <Text style={styles.badgeIcon}>🎖️</Text>
                    <View style={styles.badgeInfo}>
                      <Text style={styles.badgeTitle}>{badge.title}</Text>
                      <Text style={styles.badgeDesc}>{badge.description}</Text>
                      <Text style={styles.badgeXp}>+{badge.xpBonus} XP Bonus Awarded!</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {hasNextLesson && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onNextLesson}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Next Lesson 🚀</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={hasNextLesson ? styles.secondaryButton : styles.primaryButton}
                onPress={onGoHome}
                activeOpacity={0.8}
              >
                <Text
                  style={
                    hasNextLesson
                      ? styles.secondaryButtonText
                      : styles.primaryButtonText
                  }
                >
                  Adventure Map 🗺️
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: Math.min(width * 0.92, 420),
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 16,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  celebrationEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subheadline: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 12,
    height: 70,
  },
  starSlot: {
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starSlotMiddle: {
    marginBottom: 10,
  },
  starFilled: {
    fontSize: 50,
  },
  starMiddleText: {
    fontSize: 64,
  },
  starEmpty: {
    fontSize: 50,
    color: '#CBD5E1',
  },
  rewardPill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginVertical: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginRight: 6,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#B45309',
  },
  xpDivider: {
    height: 1,
    backgroundColor: '#FDE68A',
    width: '80%',
    marginVertical: 6,
  },
  xpRow: {
    alignItems: 'center',
  },
  xpGained: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D97706',
  },
  firstTimeBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },
  firstTimeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  levelUpCard: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 20,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  levelUpEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  levelUpTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: 1,
  },
  levelUpSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
  },
  levelUpHighlight: {
    fontWeight: '800',
    color: '#4338CA',
  },
  badgeSection: {
    width: '100%',
    marginTop: 10,
    marginBottom: 6,
  },
  badgeSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  badgeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
  },
  badgeDesc: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
  badgeXp: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginTop: 4,
  },
  actionsContainer: {
    width: '100%',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
});
