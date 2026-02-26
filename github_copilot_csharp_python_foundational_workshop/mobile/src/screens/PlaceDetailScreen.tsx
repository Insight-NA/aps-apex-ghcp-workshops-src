import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type PlaceDetailRouteProp = RouteProp<AppStackParamList, 'PlaceDetail'>;

const { width } = Dimensions.get('window');

export const PlaceDetailScreen = () => {
    const route = useRoute<PlaceDetailRouteProp>();
    const navigation = useNavigation();
    const { placeId } = route.params;

    // In a real app, fetch data based on placeId. Using static data for now matching the screenshot.
    const place = {
        name: 'Dream Beach',
        location: 'Jakarta, Indonesia',
        image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop',
        rating: 3.5,
        price: 1200,
        description: 'When an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
        facilities: ['2 Bedrooms', 'Tv Lounge', 'Breakfast', 'Wifi'],
        avatars: [
            'https://randomuser.me/api/portraits/thumb/women/4.jpg',
            'https://randomuser.me/api/portraits/thumb/men/5.jpg',
            'https://randomuser.me/api/portraits/thumb/men/6.jpg',
        ]
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: place.image }} style={styles.image} />

                    {/* Header Buttons */}
                    <SafeAreaView style={styles.headerButtons}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#1f2937" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="ellipsis-horizontal" size={24} color="#1f2937" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    {/* Price Tag */}
                    <View style={styles.priceTag}>
                        <Text style={styles.priceText}>{place.price} / night</Text>
                    </View>
                </View>

                {/* Content Body */}
                <View style={styles.contentContainer}>
                    <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                                key={star}
                                name={star <= 3 ? "star" : star === 4 ? "star-half" : "star-outline"}
                                size={16}
                                color="#4f46e5"
                                style={{ marginRight: 2 }}
                            />
                        ))}
                        <Text style={styles.ratingText}>{place.rating}</Text>
                    </View>

                    <Text style={styles.title}>{place.name}</Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={16} color="#9ca3af" />
                        <Text style={styles.locationText}>{place.location}</Text>
                    </View>

                    {/* Facilities */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.facilitiesContainer}>
                        {place.facilities.map((facility, index) => (
                            <View key={index} style={styles.facilityChip}>
                                <Text style={styles.facilityText}>{facility}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{place.description}</Text>

                    {/* Add some padding at bottom for scroll */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Bottom Floating Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.avatarGroup}>
                    {place.avatars.map((avatar, index) => (
                        <Image
                            key={index}
                            source={{ uri: avatar }}
                            style={[styles.avatar, { marginLeft: index === 0 ? 0 : -10, zIndex: 3 - index }]}
                        />
                    ))}
                    <View style={[styles.avatar, styles.moreAvatars, { marginLeft: -10, zIndex: 0 }]}>
                        <Text style={styles.moreAvatarsText}>+15</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    imageContainer: {
        height: 400,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    headerButtons: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10, // Adjust based on SafeArea if needed
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    priceTag: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#4f46e5', // Blue/Purple primary
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderTopRightRadius: 0, // Styling quirk based on screenshot if visible, else rounded
    },
    priceText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: -30, // Overlap image
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        marginLeft: 8,
        fontWeight: 'bold',
        color: '#111827',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    locationText: {
        marginLeft: 4,
        color: '#9ca3af',
        fontSize: 14,
    },
    facilitiesContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    facilityChip: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginRight: 12,
    },
    facilityText: {
        color: '#4b5563',
        fontSize: 12,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    descriptionText: {
        color: '#9ca3af',
        fontSize: 14,
        lineHeight: 22,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111827', // Dark footer
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatarGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#111827',
    },
    moreAvatars: {
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreAvatarsText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    bookButton: {
        backgroundColor: 'white',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
    },
    bookButtonText: {
        color: '#111827',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
