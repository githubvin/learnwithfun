import React from 'react';
import { ExpoRoot } from 'expo-router';
import { LearningProvider } from './src/context/LearningContext';

export default function App() {
  // @ts-ignore Expo metro require.context
  const ctx = require.context('./app');
  return (
    <LearningProvider>
      <ExpoRoot context={ctx} />
    </LearningProvider>
  );
}
