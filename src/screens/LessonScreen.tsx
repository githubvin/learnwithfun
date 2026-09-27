import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useLearning } from '../context/LearningContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CelebrationModal } from '../components/CelebrationModal';
import { LessonCompletionResult } from '../data/models';
import { audioService } from '../services/audioService';
import { colors } from '../theme/colors';

export default function LessonScreen() {
  const { lessons, questions, markLessonComplete } = useLearning();
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string }>();
  const lessonId = params.lessonId || '';

  // Find the current lesson and next lesson in sequence
  const currentLessonIndex = lessons.findIndex(l => l.id === lessonId);
  const lesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex] : undefined;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  // Get questions for this lesson
  const lessonQuestions = questions[lessonId] || [];

  // State for tracking questions and UI
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; correctIndex: number } | null>(null);
  const [questionScores, setQuestionScores] = useState<Record<number, boolean>>({});

  // Audio / Speech state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Celebration modal state
  const [completionResult, setCompletionResult] = useState<LessonCompletionResult | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Subscribe to audioService speaking state & cleanup
  useEffect(() => {
    const unsubscribe = audioService.subscribeToSpeaking(setIsSpeaking);
    return () => {
      unsubscribe();
      audioService.stopSpeech();
    };
  }, []);

  // Reset state when lessonId changes
  useEffect(() => {
    audioService.stopSpeech();
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setAnswerResult(null);
    setQuestionScores({});
    setCompletionResult(null);
    setShowCelebration(false);
  }, [lessonId]);

  const currentQuestion = lessonQuestions[currentQuestionIndex];

  // Handle lesson completion with Celebration Modal
  const handleLessonComplete = async (score: number) => {
    audioService.stopSpeech();
    const result = await markLessonComplete(score, lessonId);
    if (result) {
      audioService.playCelebrationFanfare();
      setCompletionResult(result);
      setShowCelebration(true);
    } else {
      router.replace('/');
    }
  };

  const handleNextLesson = () => {
    audioService.stopSpeech();
    setShowCelebration(false);
    if (nextLesson) {
      router.replace(`/lesson/${nextLesson.id}`);
    } else {
      router.replace('/');
    }
  };

  const handleGoHome = () => {
    audioService.stopSpeech();
    setShowCelebration(false);
    router.replace('/');
  };

  // Handle answer selection
  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    audioService.playTapSound();
    setSelectedAnswer(index);
    setAnswerResult(null);
  };

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !currentQuestion) return;

    audioService.stopSpeech();
    setIsAnswered(true);

    let isCorrect = false;
    let correctIndex = 0;

    if (currentQuestion.type === 'multiple_choice') {
      correctIndex = currentQuestion.correctAnswer;
      isCorrect = selectedAnswer === correctIndex;
    } else if (currentQuestion.type === 'true_false') {
      correctIndex = currentQuestion.correctAnswer ? 0 : 1;
      isCorrect = selectedAnswer === correctIndex;
    }

    if (isCorrect) {
      audioService.playCorrectSound();
    } else {
      audioService.playIncorrectSound();
    }

    setAnswerResult({ isCorrect, correctIndex });

    const updatedScores = {
      ...questionScores,
      [currentQuestionIndex]: isCorrect,
    };
    setQuestionScores(updatedScores);

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      audioService.stopSpeech();
      if (currentQuestionIndex < lessonQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setAnswerResult(null);
      } else {
        const totalQuestions = lessonQuestions.length;
        const correctCount = Object.values(updatedScores).filter(Boolean).length;
        const finalScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
        handleLessonComplete(finalScore);
      }
    }, 1500);
  };

  if (!lesson) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Lesson not found</Text>
        <Button title="Go Home" onPress={() => router.replace('/')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Lesson Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            audioService.stopSpeech();
            router.back();
          }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonSubtitle}>Module: {lesson.moduleId.toUpperCase()}</Text>
      </View>

      {/* Lesson Content Sections */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>📖 Learn</Text>
        <Text style={styles.sectionBody}>{lesson.introduction}</Text>

        <Text style={styles.sectionHeader}>🎮 Play</Text>
        <Text style={styles.sectionBody}>{lesson.explanation}</Text>

        <Text style={styles.sectionHeader}>💡 Demonstration</Text>
        <Text style={styles.sectionBody}>{lesson.demonstration}</Text>
      </View>

      {/* Questions Section */}
      {lessonQuestions.length > 0 && currentQuestion && (
        <View style={styles.questionsContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {lessonQuestions.length}
            </Text>
            <TouchableOpacity
              style={[styles.speakerButton, isSpeaking && styles.speakerButtonActive]}
              onPress={() => {
                if (isSpeaking) {
                  audioService.stopSpeech();
                } else {
                  audioService.unlockAudio();
                  const options =
                    currentQuestion.type === 'multiple_choice' && currentQuestion.options
                      ? currentQuestion.options
                      : ['True', 'False'];
                  audioService.speakQuestionWithOptions(currentQuestion.questionText, options);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.speakerIcon}>{isSpeaking ? '⏹️' : '🔊'}</Text>
              <Text style={[styles.speakerText, isSpeaking && styles.speakerTextActive]}>
                {isSpeaking ? 'Stop' : 'Read to Me'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.questionText}>{currentQuestion.questionText}</Text>

          {/* Multiple Choice Options */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                let backgroundColor = colors.surfaceWarm;
                let borderColor = colors.borderSubtle;
                let textColor = colors.textPrimary;

                if (isAnswered && answerResult) {
                  if (index === answerResult.correctIndex) {
                    backgroundColor = colors.scienceSoft;
                    borderColor = colors.success;
                    textColor = colors.scienceText;
                  } else if (index === selectedAnswer) {
                    backgroundColor = colors.coralSoft;
                    borderColor = colors.error;
                    textColor = colors.coralText;
                  }
                } else if (index === selectedAnswer) {
                  backgroundColor = colors.primarySoft;
                  borderColor = colors.primary;
                  textColor = colors.primary;
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionCard, { backgroundColor, borderColor }]}
                    onPress={() => handleSelectAnswer(index)}
                    disabled={isAnswered}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Feedback & Explanation */}
          {isAnswered && answerResult && (
            <View style={styles.feedbackContainer}>
              <Text
                style={[
                  styles.feedbackText,
                  answerResult.isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect,
                ]}
              >
                {answerResult.isCorrect ? '🎉 Great job! Correct!' : '🤔 Almost there! Keep trying!'}
              </Text>
              {currentQuestion.explanation && (
                <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              )}
            </View>
          )}

          {/* Submit Action */}
          <View style={styles.actionContainer}>
            <Button
              title={
                !isAnswered
                  ? 'Submit Answer'
                  : currentQuestionIndex < lessonQuestions.length - 1
                  ? 'Next Question'
                  : 'Finish Lesson'
              }
              onPress={handleSubmitAnswer}
              disabled={selectedAnswer === null || isAnswered}
              color={colors.primary}
            />
          </View>
        </View>
      )}

      {/* No Questions Fallback */}
      {lessonQuestions.length === 0 && (
        <View style={styles.noQuestionsContainer}>
          <Text style={styles.noQuestionsTitle}>🎉 Lesson Complete!</Text>
          <Text style={styles.noQuestionsText}>Great job learning about {lesson.title}!</Text>
          <Button title="Mark as Complete" onPress={() => handleLessonComplete(100)} color={colors.success} />
        </View>
      )}

      {/* Celebration Modal */}
      <CelebrationModal
        visible={showCelebration}
        result={completionResult}
        onNextLesson={handleNextLesson}
        onGoHome={handleGoHome}
        hasNextLesson={!!nextLesson}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  lessonSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 10,
  },
  questionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  speakerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.mathsBorder,
    borderWidth: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  speakerButtonActive: {
    backgroundColor: colors.coralSoft,
    borderColor: colors.error,
  },
  speakerIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  speakerText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  speakerTextActive: {
    color: colors.error,
  },
  questionText: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 18,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionCard: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 6,
    alignItems: 'center',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackContainer: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  feedbackCorrect: {
    color: colors.scienceText,
  },
  feedbackIncorrect: {
    color: colors.coralText,
  },
  explanationText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  actionContainer: {
    marginTop: 12,
  },
  noQuestionsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
  },
  noQuestionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 8,
  },
  noQuestionsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    fontSize: 18,
    color: colors.error,
    marginBottom: 16,
  },
});