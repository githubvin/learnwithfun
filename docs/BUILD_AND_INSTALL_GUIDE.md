# 📱 Learning With Fun — Build & Installation Guide

This document provides a comprehensive, step-by-step guide on how to build, install, and run the **Learning With Fun** application on an Android mobile device, along with complete technical specifications of the project's architecture and tech stack.

---

## 🛠️ 1. Project Tech Stack Details

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Core Framework** | **React Native `0.86.x`** | High-performance mobile framework utilizing the New Architecture and Hermes JavaScript engine. |
| **Platform & Tooling** | **Expo SDK `57.x`** | Managed Expo ecosystem for cross-platform bundling and native module compilation. |
| **Navigation & Routing** | **Expo Router `57.x`** | Next.js-inspired file-based routing system with nested layouts, typed routes, and error boundaries. |
| **Language** | **TypeScript `5.x`** | 100% strict type safety across all curriculum data, gamification engines, models, and UI components. |
| **Local Database & Storage** | **AsyncStorage (`@react-native-async-storage`)** | Offline-first persistent key-value store for user progress, stars, levels, avatars, and badge trophies. |
| **State Management** | **React Context API** | Centralized `LearningContext` delivering unified progression states, star counts, and audio settings. |
| **Audio & Speech Engine** | **`expo-speech` & Web Speech API** | Native text-to-speech (TTS) that reads questions and options aloud to Grade 2 children, plus audio SFX. |
| **Theme & Design System** | **Custom Kid-Friendly Palette** | Centralized in `src/theme/colors.ts` with warm pastels, soft cloud canvas (`#faf8f5`), and accessible contrast. |
| **Pedagogical Content** | **Grade 2 Curriculum** | 50 complete interactive lessons (25 Maths Kingdom + 25 Science Safari) and 150 calibrated questions. |
| **Parental Controls** | **Math Challenge Parental Gate** | Grown-ups only gate protecting settings, progress reset, and audio configuration. |
| **Build & Packaging** | **EAS Build & GitHub Actions** | Expo Application Services (EAS CLI) and automated GitHub CI/CD workflows producing standalone `.apk` files. |

---

## 🏗️ 2. How to Build the App

You have **two methods** to generate the standalone Android APK (`.apk` file):

### Method A: EAS Cloud Build (Recommended — 3 to 4 Minutes)
*No local Android Studio or heavy SDKs required on your computer.*

1. **Prerequisite**: A free account at [expo.dev/signup](https://expo.dev/signup).
2. **Log in via terminal**:
   ```bash
   npx eas-cli login
   ```
3. **Build the Standalone APK**:
   ```bash
   npx eas-cli build -p android --profile preview
   ```
4. **Get the File**:
   - The build runs on Expo's high-speed cloud runners.
   - When finished, EAS outputs a **direct download link** (e.g. `https://expo.dev/artifacts/eas/...apk`) and a **QR code** in the terminal.

---

### Method B: GitHub Actions Automated Build (Cloud CI/CD)
*Builds automatically in your GitHub repository without installing any CLI tools.*

1. Open your GitHub repository: [https://github.com/githubvin/learnwithfun](https://github.com/githubvin/learnwithfun).
2. Click on the **Actions** tab.
3. Select the **Build Android APK** workflow on the left sidebar.
4. Click **Run workflow** > select the `main` branch > click **Run workflow**.
5. When the build completes (~5–7 minutes), click the run entry and scroll to the bottom under **Artifacts**.
6. Download **`learnwithfun-release-apk.zip`** and extract `app-release.apk`.

---

### Alternative: Instant Interactive Run via Expo Go (No Build Wait Time)
*Use this if you want to test code changes instantly on your phone without building an APK.*

1. Install **Expo Go** from the Google Play Store on your Android phone.
2. In your computer terminal, run:
   ```bash
   npx expo start --tunnel
   ```
3. Open Expo Go on your phone, tap **Scan QR Code**, and scan the QR code from the terminal. The app will launch immediately.

---

## 📲 3. How to Install & Use the APK on an Android Phone

### Step 1: Download or Transfer the `.apk` File
* **Direct Download**: Open the EAS or GitHub download link directly in Google Chrome on your Android phone.
* **Transfer from PC**: Alternatively, download the `.apk` on your computer and send it to your phone via **WhatsApp**, **Google Drive**, or a **USB cable**.

### Step 2: Allow Installation from Unknown Sources
Because the `.apk` is built directly for you and not downloaded from the Google Play Store, Android will show a standard security prompt:
1. Tap the downloaded `app-release.apk` (or `learnwithfun.apk`) file.
2. If Android displays: *"For your security, your phone is not allowed to install unknown apps from this source"*:
   - Tap **Settings** on the prompt.
   - Toggle **Allow from this source** (or *Allow app installs*) to **ON**.
   - Tap the back arrow.

### Step 3: Complete Installation
1. Tap **Install**.
2. If Google Play Protect shows a popup: *"Unrecognized app details"*, tap **More details** > **Install anyway** (standard for development APKs).
3. Once installation completes, tap **Open**.

### Step 4: Using the App
* **Explorer Profile**: Tap the avatar on the top right to choose an explorer animal (Leo Lion, Dino, Panda, etc.) and enter a nickname.
* **Audio Narration**: Tap the **"🔊 Read to Me"** button on any lesson or question to hear the text read aloud.
* **Adventure Map**: Complete lessons in order to earn stars (1–3 ⭐) and unlock higher stages and worlds.
* **Parental Controls**: Access settings by tapping the gear icon and solving the grown-up math challenge.

---

## 👥 4. How to Share with Friends

To share the app with friends, family, or students:
1. Simply send them the **`.apk` file** directly through:
   - **WhatsApp / Telegram** (attach as a document).
   - **Google Drive / Dropbox** (send a shareable link).
2. Tell them to follow **Step 2 & 3** above to tap the file and enable *"Install from this source"*.
3. The app is completely **offline-first** — once installed, it requires no account creation, no login credentials, and no persistent internet connection to play all 50 lessons!
