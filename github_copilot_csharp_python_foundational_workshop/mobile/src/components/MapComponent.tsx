import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, DimensionValue } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { Platform } from 'react-native';
import { Trip } from '../types/Trip';
import { useTripStore } from '../store/useTripStore';

interface Props {
    width?: DimensionValue;
    height?: DimensionValue;
}

export const MapComponent = ({ width = '100%', height = '100%' }: Props) => {
    const mapRef = useRef<MapView>(null);
    const { stops, routeGeoJSON } = useTripStore();

    const geometry = routeGeoJSON?.geometry;
    const coordinates = (geometry && geometry.type === 'LineString' ? geometry.coordinates : [])
        .map((coord: number[]) => ({
            latitude: coord[1],
            longitude: coord[0],
        }));

    useEffect(() => {
        if (mapRef.current && stops.length > 0) {
            const identifiers = stops.map(stop => stop.id);
            mapRef.current.fitToSuppliedMarkers(identifiers, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
            // Or fit to coordinates if route exists
            if (coordinates.length > 0) {
                mapRef.current.fitToCoordinates(coordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true
                });
            }
        }
    }, [stops, routeGeoJSON]);

    // Handle provider for iOS (Apple Maps default) vs Android (Google Maps)
    // Or force Google Maps on iOS if configured.
    // Using default is safest unless specific provider requested.
    const provider = Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

    return (
        <View style={[styles.container, { width, height }]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={provider}
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {stops.map((stop) => (
                    <Marker
                        key={stop.id}
                        identifier={stop.id}
                        coordinate={{
                            latitude: stop.coordinates?.[1] || 0, // GeoJSON [lng, lat]
                            longitude: stop.coordinates?.[0] || 0,
                        }}
                        title={stop.name}
                        description={stop.address}
                        pinColor={stop.type === 'start' ? 'green' : stop.type === 'end' ? 'red' : 'blue'}
                    />
                ))}

                {coordinates.length > 0 && (
                    <Polyline
                        coordinates={coordinates}
                        strokeColor="#3b82f6" // blue-500
                        strokeWidth={4}
                    />
                )}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
