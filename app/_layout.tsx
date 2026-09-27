import React from 'react';
import { Stack } from 'expo-router';
import { LearningProvider } from '../src/context/LearningContext';

export default function RootLayout() {
  return (
    <LearningProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      />
    </LearningProvider>
  );
}
