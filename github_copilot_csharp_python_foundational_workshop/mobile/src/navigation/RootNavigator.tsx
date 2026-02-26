import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { useAuthStore } from '../store/useAuthStore';

export const RootNavigator = () => {
    const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();

    useEffect(() => {
        loadStoredAuth();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};
