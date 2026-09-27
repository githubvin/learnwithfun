// Safe lazy loading of expo-speech to support Android, iOS & Expo Web
let ExpoSpeech: any = null;
try {
  ExpoSpeech = require('expo-speech');
} catch (e) {
  ExpoSpeech = null;
}

const getPlatformOS = (): string => {
  if (typeof window !== 'undefined' && typeof (window as any).document !== 'undefined') {
    return 'web';
  }
  try {
    const RN = require('react-native');
    return RN?.Platform?.OS || 'web';
  } catch {
    return 'node';
  }
};

export interface AudioSettings {
  speechEnabled: boolean;
  sfxEnabled: boolean;
}

class AudioService {
  private speechEnabled = true;
  private sfxEnabled = true;
  private isCurrentlySpeaking = false;
  private speakingListeners: Array<(isSpeaking: boolean) => void> = [];
  private audioCtx: any = null;
  private voicesLoaded = false;
  private cachedVoice: any = null;

  constructor() {
    this.initAudioContext();
    this.initWebSpeech();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.audioCtx = new AudioCtx();
        } catch {
          this.audioCtx = null;
        }
      }
    }
  }

  private initWebSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const updateVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            this.voicesLoaded = true;
            // Prefer natural English voices (Google US English, Samantha, Microsoft Zira/David, etc.)
            this.cachedVoice =
              voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Online'))) ||
              voices.find(v => v.lang === 'en-US') ||
              voices.find(v => v.lang.startsWith('en')) ||
              voices[0];
          }
        };

        updateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = updateVoices;
        }
      } catch (err) {
        console.warn('[AudioService] Web Speech init warning:', err);
      }
    }
  }

  /**
   * Resumes and unlocks audio contexts on user interaction
   */
  public unlockAudio() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {}
    }
  }

  private ensureAudioContext() {
    if (!this.audioCtx) {
      this.initAudioContext();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // --- Settings ---
  public getSettings(): AudioSettings {
    return {
      speechEnabled: this.speechEnabled,
      sfxEnabled: this.sfxEnabled,
    };
  }

  public setSpeechEnabled(enabled: boolean) {
    this.speechEnabled = enabled;
    if (!enabled) {
      this.stopSpeech();
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  public isSpeechActive(): boolean {
    return this.isCurrentlySpeaking;
  }

  public subscribeToSpeaking(listener: (isSpeaking: boolean) => void): () => void {
    this.speakingListeners.push(listener);
    return () => {
      this.speakingListeners = this.speakingListeners.filter(l => l !== listener);
    };
  }

  private notifySpeaking(speaking: boolean) {
    this.isCurrentlySpeaking = speaking;
    this.speakingListeners.forEach(listener => {
      try {
        listener(speaking);
      } catch {}
    });
  }

  // --- Sound Effects (SFX) ---

  /**
   * Cheerful ascending chime for correct answers: C5 -> E5 -> G5
   */
  public playCorrectSound() {
    if (!this.sfxEnabled) return;
    this.unlockAudio();
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);

        gain.gain.setValueAtTime(0, now + index * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + index * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.3);
      });
    } catch {}
  }

  /**
   * Gentle, encouraging low tone for incorrect answers: E4 -> C4
   */
  public playIncorrectSound() {
    if (!this.sfxEnabled) return;
    this.unlockAudio();
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [329.63, 261.63]; // E4, C4

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.14);

        gain.gain.setValueAtTime(0, now + index * 0.14);
        gain.gain.linearRampToValueAtTime(0.18, now + index * 0.14 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.14 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.14);
        osc.stop(now + index * 0.14 + 0.38);
      });
    } catch {}
  }

  /**
   * Triumphant fanfare for lesson completion & level up: C5 -> G5 -> A5 -> C6
   */
  public playCelebrationFanfare() {
    if (!this.sfxEnabled) return;
    this.unlockAudio();
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const fanfare = [
        { freq: 523.25, time: 0.0, dur: 0.15 }, // C5
        { freq: 659.25, time: 0.15, dur: 0.15 }, // E5
        { freq: 783.99, time: 0.3, dur: 0.2 }, // G5
        { freq: 880.0, time: 0.5, dur: 0.18 }, // A5
        { freq: 1046.5, time: 0.7, dur: 0.55 }, // C6
      ];

      fanfare.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0, now + note.time);
        gain.gain.linearRampToValueAtTime(0.25, now + note.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur + 0.05);
      });
    } catch {}
  }

  /**
   * Short gentle pop for button taps
   */
  public playTapSound() {
    if (!this.sfxEnabled) return;
    this.unlockAudio();
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  // --- Speech Narration (TTS) ---

  /**
   * Cleans emojis and excessive punctuation so screen readers / speech synthesizers
   * pronounce clean Grade 2 pedagogical English.
   */
  public cleanTextForSpeech(text: string): string {
    return text
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[><=]/g, match => {
        if (match === '>') return ' is greater than ';
        if (match === '<') return ' is less than ';
        return ' equals ';
      })
      .replace(/[\(\)\[\]\{\}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Reads text aloud to the child with clear, calm pacing (0.85x speed).
   * Supports Expo Native Speech (Android / iOS) and Web Speech API (Chrome / Edge / Safari / Firefox).
   */
  public speakText(text: string) {
    if (!this.speechEnabled) return;

    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) return;

    this.unlockAudio();

    // 1. First priority on Native (Android / iOS): Use expo-speech native module
    if (getPlatformOS() !== 'web' && ExpoSpeech && typeof ExpoSpeech.speak === 'function') {
      try {
        ExpoSpeech.stop();
        ExpoSpeech.speak(cleanText, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.85,
          onStart: () => this.notifySpeaking(true),
          onDone: () => this.notifySpeaking(false),
          onStopped: () => this.notifySpeaking(false),
          onError: (err: any) => {
            console.warn('[AudioService] ExpoSpeech error:', err);
            this.notifySpeaking(false);
          },
        });
        return;
      } catch (err) {
        console.warn('[AudioService] ExpoSpeech failed, checking fallback:', err);
      }
    }

    // 2. On Web or Web fallback: Use browser SpeechSynthesis with Chrome workarounds
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 0.88;
        utterance.pitch = 1.0;

        if (this.cachedVoice) {
          utterance.voice = this.cachedVoice;
        } else {
          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            const enVoice =
              voices.find(v => v.lang === 'en-US') ||
              voices.find(v => v.lang.startsWith('en')) ||
              voices[0];
            if (enVoice) utterance.voice = enVoice;
          }
        }

        utterance.onstart = () => {
          this.notifySpeaking(true);
        };

        utterance.onend = () => {
          this.notifySpeaking(false);
        };

        utterance.onerror = (e) => {
          console.warn('[AudioService] SpeechSynthesis error:', e);
          this.notifySpeaking(false);
        };

        // Retain global reference to avoid Chrome garbage-collection speech cutoff bug
        (window as any)._lwfUtterance = utterance;

        // Slight 60ms delay after cancel to prevent Chrome cancel-dropping bug
        setTimeout(() => {
          try {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
            window.speechSynthesis.speak(utterance);
          } catch (err) {
            console.warn('[AudioService] speak failed:', err);
            this.notifySpeaking(false);
          }
        }, 60);

        return;
      } catch (err) {
        console.warn('[AudioService] Web Speech error:', err);
        this.notifySpeaking(false);
      }
    }

    // 3. Fallback: If on Web and ExpoSpeech is available
    if (ExpoSpeech && typeof ExpoSpeech.speak === 'function') {
      try {
        ExpoSpeech.stop();
        ExpoSpeech.speak(cleanText, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.85,
          onStart: () => this.notifySpeaking(true),
          onDone: () => this.notifySpeaking(false),
          onStopped: () => this.notifySpeaking(false),
        });
      } catch {}
    }
  }

  /**
   * Stops any ongoing speech immediately
   */
  public stopSpeech() {
    if (ExpoSpeech && typeof ExpoSpeech.stop === 'function') {
      try {
        ExpoSpeech.stop();
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.notifySpeaking(false);
  }

  /**
   * Reads a question and its options aloud in sequence for young learners
   */
  public speakQuestionWithOptions(questionPrompt: string, options: string[]) {
    if (!this.speechEnabled) return;

    let fullSpeech = `${questionPrompt}. `;
    options.forEach((opt, idx) => {
      const cleanOpt = this.cleanTextForSpeech(opt);
      fullSpeech += `Option ${idx + 1}: ${cleanOpt}. `;
    });

    this.speakText(fullSpeech);
  }
}

export const audioService = new AudioService();
