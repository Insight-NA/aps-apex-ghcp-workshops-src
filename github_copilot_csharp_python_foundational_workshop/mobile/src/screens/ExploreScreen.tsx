import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MapComponent } from '../components/MapComponent';

const EXPLORE_CATEGORIES = [
    { id: '1', name: 'Places to Camp', icon: 'bonfire-outline' },
    { id: '2', name: 'Parks & Nature', icon: 'leaf-outline' },
    { id: '3', name: 'Sights & Attractions', icon: 'camera-outline' },
    { id: '4', name: 'Bars & Restaurants', icon: 'restaurant-outline' },
    { id: '5', name: 'Hotels & Stays', icon: 'bed-outline' },
    { id: '6', name: 'Fuel & Rest Stops', icon: 'speedometer-outline' }, // "speedometer" as proxy for fuel/dash
    { id: '7', name: 'Coffee Shops', icon: 'cafe-outline' },
    { id: '8', name: 'Shopping', icon: 'bag-handle-outline' },
    { id: '9', name: 'Sports & Wellness', icon: 'bicycle-outline' },
    { id: '10', name: 'RV Parking', icon: 'bus-outline' },
];

const POPULAR_DESTINATIONS = [
    { id: '1', name: 'National Parks' },
    { id: '2', name: 'Beach Towns' },
    { id: '3', name: 'Mountain Getaways' },
    { id: '4', name: 'Historic Sites' },
];

export const ExploreScreen = () => {
    return (
        <View style={styles.container}>
            {/* Map Background */}
            <View style={styles.mapContainer}>
                <MapComponent />
            </View>

            {/* Overlay Content */}
            <SafeAreaView style={styles.overlaySafe} pointerEvents="box-none">
                <View style={styles.panelContainer}>
                    <View style={styles.dragHandle} />

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.headerTitle}>Explore</Text>

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                            <TextInput
                                placeholder="Search and Explore"
                                style={styles.searchInput}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        {/* Categories Grid */}
                        <View style={styles.categoriesContainer}>
                            {EXPLORE_CATEGORIES.map((cat) => (
                                <TouchableOpacity key={cat.id} style={styles.categoryChip}>
                                    <Ionicons name={cat.icon as any} size={18} color="#1f2937" style={styles.categoryIcon} />
                                    <Text style={styles.categoryText}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Banner */}
                        <TouchableOpacity style={styles.banner}>
                            <View style={styles.bannerIconContainer}>
                                <Ionicons name="map" size={24} color="white" />
                            </View>
                            <View style={styles.bannerTextContainer}>
                                <Text style={styles.bannerTitle}>Start planning your next</Text>
                                <Text style={styles.bannerSubtitle}>road trip today</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#1f2937" />
                        </TouchableOpacity>

                        {/* Featured Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Find Your Next Camping-Inspired Adventure</Text>
                                <TouchableOpacity>
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.emptyStateContainer}>
                                <Text style={styles.emptyStateText}>No featured trips yet. Check back soon!</Text>
                            </View>
                        </View>

                        {/* Popular Destinations */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Popular Destinations</Text>
                            <View style={styles.destinationsGrid}>
                                {POPULAR_DESTINATIONS.map((dest) => (
                                    <TouchableOpacity key={dest.id} style={styles.destinationCard}>
                                        <Text style={styles.destinationText}>{dest.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    overlaySafe: {
        flex: 1,
        justifyContent: 'flex-end', // Align panel to bottom if we want a sheet look, or flex-start for full
    },
    panelContainer: {
        backgroundColor: 'white',
        flex: 1,
        marginTop: 60, // Leave some space for status bar / map peek
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        paddingHorizontal: 20,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 12,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24, // Rounder search bar
        marginBottom: 24,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
        justifyContent: 'space-between',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 12,
        // Make approximate 2 columns or auto width
        // width: '48%', 
    },
    categoryIcon: {
        marginRight: 8,
    },
    categoryText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '500',
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7', // Yellow-100
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    bannerIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#f59e0b', // Amber-500
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    bannerTextContainer: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    bannerSubtitle: {
        fontSize: 14,
        color: '#4b5563',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    viewAllText: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    emptyStateContainer: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        color: '#6b7280',
        fontSize: 14,
        textAlign: 'center',
    },
    destinationsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    destinationCard: {
        backgroundColor: '#f9fafb',
        width: '48%',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    destinationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
});
