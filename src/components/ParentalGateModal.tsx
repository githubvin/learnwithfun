import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { audioService } from '../services/audioService';
import { MathProblem, generateParentGateProblem } from '../utils/parentGate';
import { colors } from '../theme/colors';

export { generateParentGateProblem };

interface ParentalGateModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  visible,
  onSuccess,
  onCancel,
}) => {
  const [problem, setProblem] = useState<MathProblem>(generateParentGateProblem);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refresh problem whenever modal opens
  useEffect(() => {
    if (visible) {
      setProblem(generateParentGateProblem());
      setErrorMessage(null);
    }
  }, [visible]);

  const handleSelectAnswer = (selectedNum: number) => {
    audioService.playTapSound();
    if (selectedNum === problem.answer) {
      setErrorMessage(null);
      onSuccess();
    } else {
      setErrorMessage('Incorrect. Please try again!');
      audioService.playIncorrectSound();
      // Generate a new question
      setTimeout(() => {
        setProblem(generateParentGateProblem());
        setErrorMessage(null);
      }, 900);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🔒</Text>
          </View>

          <Text style={styles.title}>Grown-Ups Only</Text>
          <Text style={styles.subtitle}>
            Please solve this math question to enter the settings area:
          </Text>

          {/* Math Problem Box */}
          <View style={styles.problemBox}>
            <Text style={styles.problemText}>
              {problem.num1} {problem.operation} {problem.num2} = ?
            </Text>
          </View>

          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          {/* Multiple Choice Answers */}
          <View style={styles.optionsGrid}>
            {problem.options.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.optionButton}
                onPress={() => handleSelectAnswer(opt)}
                activeOpacity={0.8}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel & Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.mathsBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  problemBox: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.borderSubtle,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginBottom: 16,
  },
  problemText: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '700',
    marginBottom: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: 18,
  },
  optionButton: {
    width: '47%',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
