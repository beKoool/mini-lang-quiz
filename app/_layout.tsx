import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Set default font for all Text components in the app
      (Text as any).defaultProps = (Text as any).defaultProps || {};
      (Text as any).defaultProps.style = { fontFamily: 'Inter_400Regular' };
      
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);


  if (!fontsLoaded) return null;

  return (
  <Stack
      screenOptions={{
        headerShown: true,
          headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Home",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="game" 
        options={{ 
          title: "Play Game"
        }} 
      />
      <Stack.Screen 
        name="results" 
        options={{ 
          title: "Results",
          headerBackVisible: false,
        }} 
      />
      <Stack.Screen 
        name="scoreHistory" 
        options={{ 
          title: "Score History",
          headerBackVisible: false,
        }} 
      />
    </Stack>);

}