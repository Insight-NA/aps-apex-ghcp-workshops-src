import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Trip } from '../types/Trip';

interface Props {
    trip: Trip;
    onPress: () => void;
}

export const TripCard = ({ trip, onPress }: Props) => {
    const distance = trip.routeGeoJSON?.properties?.distance
        ? (trip.routeGeoJSON.properties.distance / 1000).toFixed(1) + ' km'
        : '0 km';

    const stopCount = trip.stops ? trip.stops.length : 0;

    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <Image
                source={{ uri: trip.image_url || 'https://via.placeholder.com/300' }}
                style={styles.image}
            />
            <View style={styles.content}>
                <Text style={styles.title}>{trip.name}</Text>
                <Text style={styles.subtitle}>{stopCount} stops • {distance}</Text>
                {trip.description ? (
                    <Text style={styles.description} numberOfLines={2}>{trip.description}</Text>
                ) : null}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 150,
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#444',
    },
});
