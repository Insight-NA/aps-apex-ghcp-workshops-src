import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, StatusBar, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LandingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Landing'>;

const FAMILY_ROAD_IMAGES: readonly ImageSourcePropType[] = [
    // Local assets: add these image files under mobile/assets
    require('../../assets/family-road-desert.jpg'),
    require('../../assets/family-road-mountains.jpg'),
    require('../../assets/family-road-california.jpg'),
    require('../../assets/family-road-florida.jpg'),
    require('../../assets/family-road-alaska.jpg'),
];

const BACKGROUND_INDEX_KEY = 'landing_background_index';

export const LandingScreen = () => {
    const navigation = useNavigation<LandingScreenNavigationProp>();
    const [backgroundIndex, setBackgroundIndex] = useState<number>(0);

    const handleGetStarted = () => {
        navigation.navigate('Login');
    };

    useEffect(() => {
        const loadNextBackgroundIndex = async () => {
            try {
                const storedIndex = await AsyncStorage.getItem(BACKGROUND_INDEX_KEY);
                const parsedIndex = storedIndex !== null ? parseInt(storedIndex, 10) : -1;
                const safeIndex = Number.isNaN(parsedIndex) ? -1 : parsedIndex;
                const nextIndex = (safeIndex + 1 + FAMILY_ROAD_IMAGES.length) % FAMILY_ROAD_IMAGES.length;

                setBackgroundIndex(nextIndex);
                await AsyncStorage.setItem(BACKGROUND_INDEX_KEY, String(nextIndex));
            } catch (error) {
                console.error('Failed to load landing background index', error);
                setBackgroundIndex(0);
            }
        };

        void loadNextBackgroundIndex();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ImageBackground
                source={FAMILY_ROAD_IMAGES[backgroundIndex]}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.contentContainer}>
                        <View style={styles.card}>
                            <Text style={styles.title}>
                                Discover best{'\n'}places anywhere{'\n'}in the world
                            </Text>
                            <Text style={styles.subtitle}>
                                Also the leap into electronic typesetting, remaining essentially unchanged.
                            </Text>
                            <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                                <Text style={styles.buttonText}>Get Started</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#111827', // Dark background for button
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
