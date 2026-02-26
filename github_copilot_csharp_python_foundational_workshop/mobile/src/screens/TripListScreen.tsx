import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useTripStore } from '../store/useTripStore';
import { TripCard } from '../components/TripCard';
import { Trip } from '../types/Trip';
import { MapComponent } from '../components/MapComponent';

interface Props {
    navigation: any;
}

export const TripListScreen = ({ navigation }: Props) => {
    const { loadTrips } = useTripStore();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTrips = async () => {
        try {
            const data = await loadTrips();
            // Ensure data is array
            if (Array.isArray(data)) {
                setTrips(data);
            } else {
                console.warn('loadTrips did not return an array', data);
                setTrips([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTrips();
    };

    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                <MapComponent />
                {loading && !refreshing && (
                    <View style={styles.mapLoadingOverlay}>
                        <ActivityIndicator size="large" />
                    </View>
                )}
            </View>
            <View style={styles.listContainer}>
                <FlatList
                    data={trips}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TripCard
                            trip={item}
                            onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text>No trips found</Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    mapContainer: { height: 240, backgroundColor: '#ddd' },
    mapLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    listContainer: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    list: { paddingVertical: 16 },
});
