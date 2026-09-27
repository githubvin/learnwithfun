# Learning With Fun

An educational mobile app for kids to learn fundamentals with fun and playful methods.

## Documentation

- [Build & Installation Guide (APK & Tech Stack)](./docs/BUILD_AND_INSTALL_GUIDE.md) — Step-by-step instructions on generating the standalone APK, installing on Android phones, sharing with friends, and full tech stack details.
- [Project Planning Document (MVP1)](./docs/PROJECT_PLAN.md) — Comprehensive PRD, Grade 2 curriculum roadmap, 5-tier level progression, 16 badges catalog, and milestones.
- [Detailed Technical Design Document (TDD)](./docs/SYSTEM_DESIGN.md) — System architecture, TypeScript domain models, progression & badge evaluation engines, offline-first sync, and UI/UX design tokens.
- [Formal Curriculum Specification](./docs/CURRICULUM_SPECIFICATION.md) — Pedagogical framework, 50 complete Grade 2 lessons (25 Maths & 25 Science), vocabulary, and sample challenge items.
- [Gamification & Badges Specification](./docs/GAMIFICATION_AND_BADGES.md) — XP economy, 3-star rating mechanics, 5 progression levels, 10 module unlock gates, 16 badges catalog, and celebratory feedback.

## Project Setup

This is an Expo TypeScript project using:
- Expo SDK 57
- React Native 0.86 (Hermes Engine & New Architecture)
- TypeScript 5.x
- expo-router for file-based routing

## Dependencies

- expo
- expo-status-bar
- react
- react-native
- expo-router
- react-native-safe-area-context
- react-native-screens
- @expo/vector-icons

## Project Structure

- `App.tsx` - Entry point using expo-router
- `app/` - Route-based screens (expo-router)
- `src/` - Source code
  - `components/` - Reusable UI components
  - `screens/` - Screen components
  - `context/` - React context providers
  - `services/` - Service modules (Firebase, etc.)
  - `assets/` - Images, icons, etc.
- `assets/` - Static assets (icons, splash screen)
- `.claude/` - Claude Code settings (Expo plugin enabled)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```
   Then choose to run on Android, iOS, or web.

## Features Planned

- Learning adventure flow: Learn → Play → Earn → Progress
- Visual lessons (3-7 minutes each)
- Interactive challenges with immediate feedback
- Gamification: XP, stars, badges, unlocking system
- Parent dashboard for monitoring progress
- Mini-games integration for enhanced fun and engagement
- Adaptive difficulty based on performance (rule-based)

## Development Phases

1. Foundation Setup (React Native, navigation, Firebase)
2. Learning Engine (subject/module/lesson structure, question engine)
3. Content Integration (25 Maths + 25 Science lessons)
4. Mini-Games Development (educational mini-games)
5. Gamification & Rewards (XP, stars, badges, unlocking)
6. Parent Dashboard (login, progress monitoring)
7. QA & Polish (testing, optimization, beta preparation)

## Notes

- This is MVP 1 focused on Grade 2 Maths & Science
- Designed to scale to higher grades and additional subjects in later versions
- Android-first with future iOS support
- Firebase backend for authentication, database, storage, and functions
