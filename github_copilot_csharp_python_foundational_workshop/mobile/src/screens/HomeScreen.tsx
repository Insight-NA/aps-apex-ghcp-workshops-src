import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, MainTabParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';

// Mock Data
const CATEGORIES = [
    { id: '1', name: 'Restaurants', icon: 'restaurant' },
    { id: '2', name: 'Hotels', icon: 'bed' },
    { id: '3', name: 'Gas', icon: 'color-fill' }, // using color-fill as loose approx for gas pump if local-gas-station not avail
    { id: '4', name: 'Coffee', icon: 'cafe' },
    { id: '5', name: 'Shops', icon: 'cart' },
];

const PLACES = [
    {
        id: '1',
        name: 'Sand Castle',
        location: 'Jakarta, Indonesia',
        image: 'https://images.unsplash.com/photo-1519046904884-53103b34b271?q=80&w=600&auto=format&fit=crop', // Santorini vibe
        rating: 4.8,
        distance: '2.5km',
        isHot: true,
    },
    {
        id: '2',
        name: 'Dream Beach',
        location: 'Bali, Indonesia',
        image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&auto=format&fit=crop', // Tropical beach
        rating: 4.9,
        distance: '3.7km',
        isHot: true,
    },
    {
        id: '3',
        name: 'Mountain View',
        location: 'Swiss Alps',
        image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop',
        rating: 4.5,
        distance: '12km',
        isHot: false,
    },
];

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'PlaceDetail'>; // Ideally strictly typed but simplifying for now

export const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user, isAuthenticated } = useAuthStore();
    const [selectedCategory, setSelectedCategory] = useState('2'); // Default to Hotels as per screenshot

    const displayName = isAuthenticated && user?.name ? user.name : 'Guest';
    // Use user picture or a car placeholder for guest
    const avatarSource = isAuthenticated && user?.picture
        ? { uri: user.picture }
        : { uri: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=200&auto=format&fit=crop' }; // Car image for guest

    const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => {
        const isSelected = selectedCategory === item.id;
        return (
            <TouchableOpacity
                style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                onPress={() => setSelectedCategory(item.id)}
            >
                <View style={[styles.categoryIconContainer, isSelected && styles.categoryIconContainerSelected]}>
                    <Ionicons
                        name={item.icon as any}
                        size={24}
                        color={isSelected ? 'white' : '#1f2937'}
                    />
                </View>
                <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    const renderPlace = ({ item }: { item: typeof PLACES[0] }) => (
        <TouchableOpacity
            style={styles.placeCard}
            onPress={() => navigation.navigate('PlaceDetail', { placeId: item.id })}
        >
            <Image source={{ uri: item.image }} style={styles.placeImage} />
            <TouchableOpacity style={styles.favoriteButton}>
                <Ionicons name="heart" size={20} color={item.id === '2' ? '#3b82f6' : 'white'} />
            </TouchableOpacity>

            {item.isHot && (
                <View style={styles.hotTag}>
                    <Text style={styles.hotTagText}>HOT</Text>
                </View>
            )}

            <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{item.name}</Text>
                <View style={styles.placeFooter}>
                    <View style={styles.placeLocation}>
                        {/* <Ionicons name="location-outline" size={14} color="#6b7280" /> */}
                        <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/thumb/men/1.jpg' }}
                            style={styles.avatarMini}
                        />
                        <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/thumb/women/2.jpg' }}
                            style={[styles.avatarMini, { marginLeft: -8 }]}
                        />
                        <Image
                            source={{ uri: 'https://randomuser.me/api/portraits/thumb/men/3.jpg' }}
                            style={[styles.avatarMini, { marginLeft: -8 }]}
                        />
                    </View>
                    <Text style={styles.distanceText}>{item.distance}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greetingTitle}>Hi, {displayName}</Text>
                        {isAuthenticated && user?.location && (
                            <View style={styles.locationRow}>
                                <Ionicons name="location" size={16} color="#9ca3af" />
                                <Text style={styles.locationText}>{user.location}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.notificationButton}>
                            <Ionicons name="notifications" size={24} color="#1f2937" />
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>
                        <Image
                            source={avatarSource}
                            style={styles.avatar}
                        />
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search for places..."
                        style={styles.searchInput}
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Categories */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={CATEGORIES}
                    renderItem={renderCategory}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />

                {/* Places */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    {/* Screenshot actually says "Categories" again for the places section, which might be a typo in design or just labeling 'Places' as categories for some reason. sticking to 'Popular' or 'Places' might be better but I will match screenshot text if possible, or assume it meant "Popular" */}
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={PLACES}
                    renderItem={renderPlace}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.placesList}
                />

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollView: {
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    greetingTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        marginLeft: 4,
        color: '#9ca3af',
        fontSize: 14,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        marginRight: 16,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 1,
        borderColor: 'white',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#3b82f6',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    viewAllText: {
        color: '#3b82f6',
        fontSize: 14,
        fontWeight: '600',
    },
    categoriesList: {
        paddingRight: 24,
        marginBottom: 24,
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: 20,
    },
    categoryItemSelected: {
        // slightly different style if needed
    },
    categoryIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryIconContainerSelected: {
        backgroundColor: '#2563eb', // Blue
        shadowColor: '#2563eb',
        shadowOpacity: 0.3,
    },
    categoryName: {
        fontSize: 12,
        color: '#4b5563',
        fontWeight: '500',
    },
    categoryNameSelected: {
        color: '#111827',
        fontWeight: '600',
    },
    placesList: {
        paddingRight: 24,
        paddingBottom: 24, // allow space for shadow
    },
    placeCard: {
        width: 250,
        height: 320,
        backgroundColor: 'white',
        borderRadius: 24,
        marginRight: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    placeImage: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    favoriteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hotTag: {
        position: 'absolute',
        top: 180,
        left: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#4f46e5',
        borderRadius: 8,
        zIndex: 10,
    },
    hotTagText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    placeInfo: {
        padding: 16,
        paddingTop: 24,
    },
    placeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    placeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    placeLocation: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarMini: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'white',
    },
    distanceText: {
        fontSize: 12,
        color: '#9ca3af',
    },
});
