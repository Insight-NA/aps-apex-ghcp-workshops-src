import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { useTripStore } from '../store/useTripStore';
import { MapComponent } from '../components/MapComponent';
import { StackScreenProps } from '@react-navigation/stack';
import { AppStackParamList } from '../types/navigation';
import { Stop } from '../types/Stop';

type Props = StackScreenProps<AppStackParamList, 'TripDetail'>;

export const TripDetailScreen = ({ route, navigation }: Props) => {
    const { tripId } = route.params;
    const { loadTrip, stops, routeDistance, routeDuration } = useTripStore();
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                await loadTrip(tripId);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [tripId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const renderStop = ({ item, index }: { item: Stop; index: number }) => (
        <View style={styles.stopItem}>
            <View style={styles.stopIndex}>
                <Text style={styles.stopIndexText}>{index + 1}</Text>
            </View>
            <View style={styles.stopContent}>
                <Text style={styles.stopName}>{item.name}</Text>
                <Text style={styles.stopAddress}>{item.address}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Map Section - Top 50% */}
            <View style={styles.mapContainer}>
                <MapComponent height="100%" />
            </View>

            {/* Details Section - Bottom 50% */}
            <View style={styles.detailsContainer}>
                <View style={styles.header}>
                    <View style={styles.stats}>
                        <Text style={styles.statText}>
                            {(routeDistance / 1000).toFixed(1)} km
                        </Text>
                        <Text style={styles.statSeparator}>•</Text>
                        <Text style={styles.statText}>
                            {formatDuration(routeDuration)}
                        </Text>
                    </View>
                </View>

                <FlatList
                    data={stops}
                    keyExtractor={(item) => item.id}
                    renderItem={renderStop}
                    contentContainerStyle={styles.stopsList}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    mapContainer: { height: '50%', width: '100%' },
    detailsContainer: { flex: 1, backgroundColor: 'white' },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    stats: { flexDirection: 'row', alignItems: 'center' },
    statText: { fontSize: 16, fontWeight: '600', color: '#333' },
    statSeparator: { marginHorizontal: 8, color: '#ccc' },
    stopsList: { padding: 16 },
    stopItem: { flexDirection: 'row', marginBottom: 16 },
    stopIndex: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: '#3b82f6',
        justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    stopIndexText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    stopContent: { flex: 1 },
    stopName: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
    stopAddress: { fontSize: 14, color: '#666' },
});
