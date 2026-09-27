import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useLearning } from '../../src/context/LearningContext';
import { useRouter } from 'expo-router';
import { Badge } from '../../src/data/models';
import { getBadgeEmoji, getBadgeHint } from '../../src/utils/badgeHelpers';
import { audioService } from '../../src/services/audioService';
import { colors } from '../../src/theme/colors';

type FilterCategory = 'all' | 'maths' | 'science' | 'milestones';

export default function BadgesScreen() {
  const { badges, userLevel, userProfile } = useLearning();
  const router = useRouter();

  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const progressPercent = Math.round((unlockedCount / badges.length) * 100);

  const filteredBadges = useMemo(() => {
    return badges.filter(badge => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'maths') return badge.category === 'maths';
      if (selectedFilter === 'science') return badge.category === 'science';
      if (selectedFilter === 'milestones') {
        return (
          badge.category === 'milestone' ||
          badge.category === 'mastery' ||
          badge.category === 'progress' ||
          badge.category === 'habit' ||
          badge.category === 'capstone'
        );
      }
      return true;
    });
  }, [badges, selectedFilter]);

  const handleOpenBadge = (badge: Badge) => {
    audioService.playTapSound();
    setSelectedBadge(badge);
    if (badge.unlocked) {
      audioService.playCorrectSound();
    }
  };

  const handleCloseModal = () => {
    audioService.playTapSound();
    setSelectedBadge(null);
  };

  const renderBadge = ({ item }: { item: Badge }) => {
    const emoji = getBadgeEmoji(item.id);
    const isUnlocked = item.unlocked;

    return (
      <TouchableOpacity
        style={[
          styles.badgeCard,
          isUnlocked ? styles.badgeUnlocked : styles.badgeLocked,
        ]}
        onPress={() => handleOpenBadge(item)}
        activeOpacity={0.85}
      >
        <View
          style={[
            styles.badgeIconContainer,
            isUnlocked ? styles.iconContainerUnlocked : styles.iconContainerLocked,
          ]}
        >
          <Text style={styles.badgeEmoji}>{isUnlocked ? emoji : '🔒'}</Text>
        </View>

        <View style={styles.badgeInfo}>
          <View style={styles.badgeHeaderRow}>
            <Text style={[styles.badgeTitle, !isUnlocked && styles.textMuted]}>
              {item.title}
            </Text>
            <View style={styles.xpPill}>
              <Text style={styles.xpBonus}>+{item.xpBonus} XP</Text>
            </View>
          </View>

          <Text style={styles.badgeDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.badgeFooterRow}>
            <Text
              style={[
                styles.categoryTag,
                item.category === 'maths'
                  ? styles.mathsTag
                  : item.category === 'science'
                  ? styles.scienceTag
                  : styles.milestoneTag,
              ]}
            >
              {item.category.toUpperCase()}
            </Text>

            {isUnlocked ? (
              <Text style={styles.unlockedTag}>✨ Earned</Text>
            ) : (
              <Text style={styles.lockedTag}>Tap for hint 💡</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Trophy Cabinet 🏆</Text>
          <View style={styles.badgeCountPill}>
            <Text style={styles.badgeCountText}>
              {unlockedCount} / {badges.length}
            </Text>
          </View>
        </View>

        <Text style={styles.headerSubtitle}>
          Collect badges by exploring Maths & Science!
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{progressPercent}% Unlocked</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
          onPress={() => {
            audioService.playTapSound();
            setSelectedFilter('all');
          }}
        >
          <Text
            style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}
          >
            🌟 All ({badges.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === 'maths' && styles.filterChipActiveMaths,
          ]}
          onPress={() => {
            audioService.playTapSound();
            setSelectedFilter('maths');
          }}
        >
          <Text
            style={[styles.filterText, selectedFilter === 'maths' && styles.filterTextActive]}
          >
            📘 Maths (5)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === 'science' && styles.filterChipActiveScience,
          ]}
          onPress={() => {
            audioService.playTapSound();
            setSelectedFilter('science');
          }}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === 'science' && styles.filterTextActive,
            ]}
          >
            🔬 Science (5)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedFilter === 'milestones' && styles.filterChipActiveMilestone,
          ]}
          onPress={() => {
            audioService.playTapSound();
            setSelectedFilter('milestones');
          }}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === 'milestones' && styles.filterTextActive,
            ]}
          >
            🏆 Quests (6)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Badges List */}
      <FlatList
        data={filteredBadges}
        keyExtractor={item => item.id}
        renderItem={renderBadge}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Interactive Badge Detail Modal */}
      {selectedBadge && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View
                style={[
                  styles.modalIconCircle,
                  selectedBadge.unlocked
                    ? styles.modalIconUnlocked
                    : styles.modalIconLocked,
                ]}
              >
                <Text style={styles.modalEmoji}>
                  {selectedBadge.unlocked
                    ? getBadgeEmoji(selectedBadge.id)
                    : '🔒'}
                </Text>
              </View>

              <Text style={styles.modalTitle}>{selectedBadge.title}</Text>
              <Text style={styles.modalHeadline}>
                "{selectedBadge.popupHeadline}"
              </Text>

              <View style={styles.modalXpPill}>
                <Text style={styles.modalXpText}>
                  Reward: +{selectedBadge.xpBonus} XP
                </Text>
              </View>

              <Text style={styles.modalDesc}>{selectedBadge.description}</Text>

              {/* Status Box */}
              <View
                style={[
                  styles.modalStatusBox,
                  selectedBadge.unlocked
                    ? styles.statusBoxUnlocked
                    : styles.statusBoxLocked,
                ]}
              >
                <Text style={styles.modalStatusTitle}>
                  {selectedBadge.unlocked
                    ? '🎉 Badge Unlocked!'
                    : '💡 How to Unlock:'}
                </Text>
                <Text style={styles.modalStatusText}>
                  {selectedBadge.unlocked
                    ? 'Awesome achievement! This badge is part of your permanent trophy collection.'
                    : getBadgeHint(selectedBadge.id)}
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleCloseModal}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseText}>Got it! 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  badgeCountPill: {
    backgroundColor: '#ffffff',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  badgeCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 14,
  },
  progressContainer: {
    marginTop: 2,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.sunshineYellow,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'right',
    marginTop: 4,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipActiveMaths: {
    backgroundColor: colors.mathsPrimary,
    borderColor: colors.mathsPrimary,
  },
  filterChipActiveScience: {
    backgroundColor: colors.sciencePrimary,
    borderColor: colors.sciencePrimary,
  },
  filterChipActiveMilestone: {
    backgroundColor: colors.sunshineGold,
    borderColor: colors.sunshineGold,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  badgeCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1.5,
  },
  badgeUnlocked: {
    borderColor: colors.sunshineBorder,
  },
  badgeLocked: {
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceWarm,
  },
  badgeIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerUnlocked: {
    backgroundColor: colors.sunshineSoft,
    borderWidth: 1.5,
    borderColor: colors.sunshineBorder,
  },
  iconContainerLocked: {
    backgroundColor: colors.borderSubtle,
  },
  badgeEmoji: {
    fontSize: 26,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  textMuted: {
    color: colors.textSecondary,
  },
  xpPill: {
    backgroundColor: colors.sunshineSoft,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.sunshineBorder,
  },
  xpBonus: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.sunshineGold,
  },
  badgeDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  badgeFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '800',
    paddingVertical: 2,
    paddingHorizontal: 6,
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
  milestoneTag: {
    backgroundColor: colors.sunshineSoft,
    color: colors.sunshineGold,
  },
  unlockedTag: {
    fontSize: 11,
    color: colors.scienceText,
    fontWeight: '700',
  },
  lockedTag: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconUnlocked: {
    backgroundColor: colors.sunshineSoft,
    borderWidth: 2,
    borderColor: colors.sunshineBorder,
  },
  modalIconLocked: {
    backgroundColor: colors.surfaceWarm,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
  },
  modalEmoji: {
    fontSize: 42,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalHeadline: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalXpPill: {
    backgroundColor: colors.sunshineSoft,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.sunshineBorder,
    marginBottom: 14,
  },
  modalXpText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.sunshineGold,
  },
  modalDesc: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalStatusBox: {
    width: '100%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  statusBoxUnlocked: {
    backgroundColor: colors.scienceSoft,
    borderColor: colors.scienceBorder,
  },
  statusBoxLocked: {
    backgroundColor: colors.mathsSoft,
    borderColor: colors.mathsBorder,
  },
  modalStatusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalStatusText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  modalCloseButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
