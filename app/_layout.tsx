import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LearningProvider } from '../src/context/LearningContext';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <LearningProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#faf8f5' },
        }}
      />
    </LearningProvider>
  );
}
