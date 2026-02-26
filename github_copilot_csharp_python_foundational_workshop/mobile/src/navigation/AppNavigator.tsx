import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, AppStackParamList } from '../types/navigation';
import { TripListScreen } from '../screens/TripListScreen';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { TripPlannerScreen } from '../screens/TripPlannerScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ExploreScreen } from '../screens/ExploreScreen';

import { HomeScreen } from '../screens/HomeScreen';
import { PlaceDetailScreen } from '../screens/PlaceDetailScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<AppStackParamList>();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: '#111827', // Dark tab bar from screenshot
                borderTopWidth: 0,
                height: 80,
                paddingTop: 10,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                elevation: 0,
            },
            tabBarActiveTintColor: 'white',
            tabBarInactiveTintColor: '#4b5563',
            tabBarShowLabel: false,
        }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ alignItems: 'center' }}>
                            <Ionicons name="home" size={24} color={color} />
                            {color === 'white' && (
                                <View style={{ width: 20, height: 3, backgroundColor: '#3b82f6', marginTop: 4, borderRadius: 1.5 }} />
                            )}
                        </View>
                    ),
                }}
            />
            <Tab.Screen name="Trips" component={TripListScreen}
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />
                }}
            />
            <Tab.Screen name="Explore" component={ExploreScreen}
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />
                }}
            />
            <Tab.Screen name="Profile" component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />
                }}
            />
        </Tab.Navigator>
    );
};

export const AppNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={BottomTabNavigator} />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} />
            <Stack.Screen name="TripPlanner" component={TripPlannerScreen} />
            <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
        </Stack.Navigator>
    );
};
