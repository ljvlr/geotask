import React, { useEffect } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { TaskProvider } from '../context/TaskContext';

function InitialLayout() {
  const { session, initialized, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const isAuthScreen = pathname === '/';

    if (!session && !isAuthScreen) {
      router.replace('/');
    } else if (session && isAuthScreen) {
      if (isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [session, initialized, isAdmin, pathname]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="map" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TaskProvider>
        <InitialLayout />
      </TaskProvider>
    </AuthProvider>
  );
}