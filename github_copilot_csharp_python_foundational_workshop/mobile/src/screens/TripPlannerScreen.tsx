import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useTripStore } from '../store/useTripStore';
import { AddStopModal } from '../components/AddStopModal';
import { VehiclePickerModal } from '../components/VehiclePickerModal';
import { Stop } from '../types/Stop';
import { Vehicle } from '../types/Vehicle';
import { StackScreenProps } from '@react-navigation/stack';
import { AppStackParamList } from '../types/navigation';
import api from '../services/api';

// type Props = StackScreenProps<AppStackParamList, 'TripPlanner'>;

export const TripPlannerScreen = ({ navigation }: any) => {
    const { stops, addStop, removeStop, saveTrip, vehicleSpecs, resetTrip, setRoute, routeGeoJSON, routeDistance, routeDuration, setVehicleSpecs } = useTripStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
    const [tripName, setTripName] = useState('');
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

    React.useEffect(() => {
        resetTrip();
    }, []);

    const handleAddStop = (stop: Stop) => {
        // Logic to determine type (start/end) based on order could be added here
        // For now, reuse store logic or default to 'stop'
        if (stops.length === 0) stop.type = 'start';
        else stop.type = 'stop'; // Last one update to end? Store reorder logic handles this?

        addStop(stop);
    };

    const handleCalculateRoute = async () => {
        if (stops.length < 2) {
            Alert.alert('Not Enough Stops', 'Please add at least 2 stops to calculate a route');
            return;
        }

        setIsCalculatingRoute(true);
        try {
            // Format coordinates for Mapbox API: [lng, lat]
            const coordinates = stops.map(stop => [stop.coordinates[0], stop.coordinates[1]]);
            
            const response = await api.post('/api/directions', {
                coordinates,
                vehicle_type: vehicleSpecs.type || 'car',
            });

            const { route } = response.data;

            if (route) {
                // Extract GeoJSON, distance, duration, and legs from response
                const geoJSON = route.geometry || null;
                const distance = route.distance || 0;
                const duration = route.duration || 0;
                const legs = route.legs || [];

                setRoute(geoJSON, distance, duration, legs);
                Alert.alert('Success', `Route calculated: ${(distance / 1000).toFixed(1)} km, ${(duration / 60).toFixed(0)} minutes`);
            }
        } catch (error: any) {
            console.error('Route calculation error:', error);
            Alert.alert('Error', error.response?.data?.detail || 'Failed to calculate route');
        } finally {
            setIsCalculatingRoute(false);
        }
    };

    const handleSave = async () => {
        if (!tripName) {
            Alert.alert('Missing Name', 'Please enter a trip name');
            return;
        }
        if (stops.length < 2) {
            Alert.alert('Not Enough Stops', 'Please add at least 2 stops');
            return;
        }
        if (!routeGeoJSON) {
            Alert.alert('No Route', 'Please calculate the route before saving', [
                { text: 'Cancel' },
                { text: 'Calculate Now', onPress: handleCalculateRoute },
            ]);
            return;
        }
        try {
            await saveTrip(tripName);
            Alert.alert('Success', 'Trip saved!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save trip');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.input}
                    placeholder="Trip Name"
                    value={tripName}
                    onChangeText={setTripName}
                />
                <Button title="Save" onPress={handleSave} />
            </View>

            {/* Vehicle Selection */}
            <TouchableOpacity 
                style={styles.vehicleBar} 
                onPress={() => setVehicleModalVisible(true)}
            >
                <Text style={styles.vehicleText}>
                    Vehicle: {vehicleSpecs.type.toUpperCase()} ({vehicleSpecs.height}m H)
                </Text>
                <Text style={styles.vehicleArrow}>›</Text>
            </TouchableOpacity>

            {/* Route Summary */}
            {routeGeoJSON && (
                <View style={styles.routeSummary}>
                    <Text style={styles.routeSummaryText}>
                        Distance: {(routeDistance / 1000).toFixed(1)} km • Duration: {(routeDuration / 60).toFixed(0)} min
                    </Text>
                </View>
            )}

            <Text style={styles.subHeader}>Stops ({stops.length})</Text>

            <FlatList
                data={stops}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View style={styles.stopItem}>
                        <View style={styles.stopInfo}>
                            <Text style={styles.stopName}>{index + 1}. {item.name}</Text>
                            <Text style={styles.stopAddress}>{item.address}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeStop(item.id)} style={styles.removeButton}>
                            <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListFooterComponent={
                    <>
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                            <Text style={styles.addButtonText}>+ Add Stop</Text>
                        </TouchableOpacity>
                        {stops.length >= 2 && (
                            <TouchableOpacity 
                                onPress={handleCalculateRoute} 
                                style={styles.calculateButton}
                                disabled={isCalculatingRoute}
                            >
                                {isCalculatingRoute ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.calculateButtonText}>
                                        {routeGeoJSON ? 'Recalculate Route' : 'Calculate Route'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </>
                }
            />

            <AddStopModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAddStop={handleAddStop}
            />

            <VehiclePickerModal
                visible={vehicleModalVisible}
                onClose={() => setVehicleModalVisible(false)}
                onSelectVehicle={(vehicle: Vehicle) => {
                    setVehicleSpecs(vehicle);
                    // Clear existing route when vehicle changes
                    if (routeGeoJSON) {
                        Alert.alert(
                            'Vehicle Changed',
                            'Please recalculate the route with the new vehicle specifications'
                        );
                    }
                }}
                currentVehicle={vehicleSpecs}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: {
        flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee',
        alignItems: 'center', justifyContent: 'space-between'
    },
    input: { flex: 1, fontSize: 18, marginRight: 10, padding: 8, backgroundColor: '#f9f9f9', borderRadius: 4 },
    subHeader: { padding: 16, fontSize: 16, fontWeight: 'bold', backgroundColor: '#f2f2f2' },
    stopItem: {
        flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee',
        alignItems: 'center', justifyContent: 'space-between'
    },
    stopInfo: { flex: 1 },
    stopName: { fontSize: 16, fontWeight: '500' },
    stopAddress: { fontSize: 14, color: '#666' },
    removeButton: { padding: 8 },
    removeText: { color: 'red' },
    addButton: { padding: 16, alignItems: 'center' },
    addButtonText: { color: '#007AFF', fontSize: 16, fontWeight: 'bold' },
    routeSummary: {
        backgroundColor: '#e7f3ff',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#b3d9ff',
    },
    routeSummaryText: {
        color: '#0066cc',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    calculateButton: {
        backgroundColor: '#3b82f6',
        margin: 16,
        marginTop: 8,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    vehicleBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    vehicleText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1f2937',
    },
    vehicleArrow: {
        fontSize: 20,
        color: '#6b7280',
    },
});
