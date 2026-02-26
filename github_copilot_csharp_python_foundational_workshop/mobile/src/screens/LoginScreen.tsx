import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthStore();

    // Configure Google OAuth
    // Note: You need to set EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID in your .env file
    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        redirectUri: makeRedirectUri({
            scheme: 'roadtrip',
        }),
    });

    useEffect(() => {
        if (response?.type === 'success') {
            handleGoogleLogin(response.authentication?.accessToken);
        }
    }, [response]);

    const handleGoogleLogin = async (googleToken?: string) => {
        if (!googleToken) {
            Alert.alert('Error', 'Failed to get Google access token');
            return;
        }

        setIsLoading(true);
        try {
            // Send Google token to backend for verification and JWT generation
            const result = await api.post('/api/auth/google', {
                token: googleToken,
            });

            const { access_token, user } = result.data;

            // Store JWT and user data in auth store
            await login(access_token, user);
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert(
                'Login Failed',
                error.response?.data?.detail || 'Failed to authenticate with server'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleGooglePress = () => {
        promptAsync();
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* App Logo/Title */}
                <View style={styles.header}>
                    <Text style={styles.title}>Road Trip Planner</Text>
                    <Text style={styles.subtitle}>Plan your perfect journey</Text>
                </View>

                {/* Google Sign In Button */}
                <TouchableOpacity
                    style={[styles.googleButton, !request && styles.buttonDisabled]}
                    onPress={handleGooglePress}
                    disabled={!request || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Image
                                source={{
                                    uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
                                }}
                                style={styles.googleIcon}
                            />
                            <Text style={styles.googleButtonText}>Sign in with Google</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Info Text */}
                <Text style={styles.infoText}>
                    Sign in to save your trips and access them across devices
                </Text>

                {/* Skip Login Button (Guest Mode) */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={async () => {
                        setIsLoading(true);
                        try {
                            const result = await api.post('/api/auth/guest');
                            const { access_token, user } = result.data;
                            await login(access_token, user);
                        } catch (error: any) {
                            console.error('Guest login error:', error);
                            Alert.alert('Error', 'Failed to continue as guest. Please try again.');
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                    disabled={isLoading}
                >
                    <Text style={styles.skipButtonText}>
                        {isLoading ? 'Please wait...' : 'Continue as Guest'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4285F4',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        width: '100%',
        maxWidth: 320,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    googleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoText: {
        marginTop: 24,
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        maxWidth: 300,
    },
    skipButton: {
        marginTop: 32,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#fff',
    },
    skipButtonText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});
