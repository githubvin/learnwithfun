import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useLearning } from '../../src/context/LearningContext';
import { useRouter } from 'expo-router';
import { AVATARS_CATALOG, getAvatarById, AvatarItem } from '../../src/data/avatarsCatalog';
import { audioService } from '../../src/services/audioService';
import { colors } from '../../src/theme/colors';

export default function ProfileScreen() {
  const { userProfile, userLevel, totalStars, updateUserProfile } = useLearning();
  const router = useRouter();

  const [nicknameInput, setNicknameInput] = useState<string>(userProfile.nickname);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(userProfile.avatarId || 'lion');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const currentAvatar = getAvatarById(selectedAvatarId);

  const handleSelectAvatar = async (avatar: AvatarItem) => {
    audioService.playTapSound();
    setSelectedAvatarId(avatar.id);
    await updateUserProfile({ avatarId: avatar.id });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveNickname = async () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      Alert.alert('Oops!', 'Please enter a fun nickname for your explorer!');
      return;
    }
    audioService.playTapSound();
    await updateUserProfile({ nickname: trimmed });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const nicknameSuggestions = [
    'Super Star',
    'Curious Leo',
    'Space Cadet',
    'Smart Owl',
    'Dino Whiz',
    'Math Star',
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Explorer Profile 🎒</Text>
        <Text style={styles.headerSubtitle}>Customize your hero avatar & name!</Text>
      </View>

      {/* Hero Avatar Card */}
      <View style={[styles.heroCard, { backgroundColor: currentAvatar.bgColor }]}>
        <View style={styles.heroEmojiCircle}>
          <Text style={styles.heroEmoji}>{currentAvatar.emoji}</Text>
        </View>

        <Text style={styles.heroName}>{userProfile.nickname}</Text>
        <Text style={styles.heroCharacter}>{currentAvatar.name}</Text>
        <Text style={styles.heroDescription}>{currentAvatar.description}</Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{userLevel.badgeIcon} Lvl {userLevel.level}</Text>
            <Text style={styles.heroStatLabel}>{userLevel.title}</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>⭐ {totalStars}</Text>
            <Text style={styles.heroStatLabel}>Stars</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>⚡ {userProfile.totalXp}</Text>
            <Text style={styles.heroStatLabel}>XP</Text>
          </View>
        </View>
      </View>

      {saveSuccess && (
        <View style={styles.toastCard}>
          <Text style={styles.toastText}>✨ Profile updated successfully! 🎉</Text>
        </View>
      )}

      {/* Choose Avatar Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Explorer Avatar</Text>
        <Text style={styles.sectionSubtitle}>Tap to pick your learning companion</Text>

        <View style={styles.avatarGrid}>
          {AVATARS_CATALOG.map(avatar => {
            const isSelected = avatar.id === selectedAvatarId;
            return (
              <TouchableOpacity
                key={avatar.id}
                style={[
                  styles.avatarCard,
                  { backgroundColor: avatar.bgColor },
                  isSelected && styles.avatarCardSelected,
                ]}
                onPress={() => handleSelectAvatar(avatar)}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                <Text style={styles.avatarLabel}>{avatar.name}</Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Explorer Nickname Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Explorer Nickname</Text>
        <Text style={styles.sectionSubtitle}>What should we call you in the app?</Text>

        <View style={styles.nicknameRow}>
          <TextInput
            style={styles.textInput}
            value={nicknameInput}
            onChangeText={setNicknameInput}
            placeholder="Enter nickname..."
            placeholderTextColor="#94a3b8"
            maxLength={18}
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveNickname}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save 💾</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Suggestions */}
        <Text style={styles.suggestionTitle}>Quick Ideas:</Text>
        <View style={styles.suggestionsContainer}>
          {nicknameSuggestions.map(suggestion => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionChip}
              onPress={() => {
                audioService.playTapSound();
                setNicknameInput(suggestion);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionChipText}>✨ {suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Parental Gate Link */}
      <TouchableOpacity
        style={styles.settingsGateButton}
        onPress={() => router.push('/settings' as any)}
        activeOpacity={0.85}
      >
        <Text style={styles.settingsGateIcon}>⚙️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingsGateTitle}>Grown-Ups & Audio Settings</Text>
          <Text style={styles.settingsGateDesc}>Audio toggles, progress stats & safety controls</Text>
        </View>
        <Text style={styles.settingsGateArrow}>➔</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  heroCard: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  heroEmojiCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  heroCharacter: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  heroStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: colors.borderSubtle,
  },
  toastCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: colors.scienceSoft,
    borderColor: colors.scienceBorder,
    borderWidth: 1.5,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.scienceText,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatarCard: {
    width: '22%',
    aspectRatio: 0.85,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2.5,
    transform: [{ scale: 1.05 }],
  },
  avatarEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  nicknameRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.mathsBorder,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  suggestionChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  settingsGateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  settingsGateIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  settingsGateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  settingsGateDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingsGateArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 8,
  },
});
