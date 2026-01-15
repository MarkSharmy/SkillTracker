import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import GoalDetail from './screens/GoalDetail';
import TaskDetail from './screens/TaskDetail';
import SubtaskDetail from './screens/SubtaskDetail';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Check for token on boot
    const bootstrapAsync = async () => {
      let token;
      try {
        token = await AsyncStorage.getItem('token');
      } catch (e) {
        console.error("Token restore failed", e);
      }
      setUserToken(token);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  // Loading Screen (prevents flicker)
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          // AUTH STACK
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // APP STACK
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={Dashboard} 
              options={{ headerShown: true, title: 'Skill Tracker' }} 
            />
            <Stack.Screen name="GoalDetail" component={GoalDetail} />
            <Stack.Screen name="TaskDetail" component={TaskDetail} />
            <Stack.Screen name="SubtaskDetail" component={SubtaskDetail} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}