import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { Stop } from '../types/Stop';

interface Props {
    visible: boolean;
    onClose: () => void;
    onAddStop: (stop: Stop) => void;
}

export const AddStopModal = ({ visible, onClose, onAddStop }: Props) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length > 2) {
                searchPoints();
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const searchPoints = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/search', { params: { query } });
            setResults(res.data.features || []);
        } catch (error) {
            console.error(error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item: any) => {
        const stop: Stop = {
            id: item.id || Date.now().toString(),
            name: item.text,
            address: item.place_name,
            coordinates: item.geometry.coordinates,
            type: 'stop',
        };
        onAddStop(stop);
        setQuery('');
        setResults([]);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide">
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TextInput
                        style={styles.input}
                        placeholder="Search for a place..."
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id || Math.random().toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSelect(item)} style={styles.item}>
                            <Text style={styles.itemName}>{item.text}</Text>
                            <Text style={styles.itemAddress}>{item.place_name}</Text>
                        </TouchableOpacity>
                    )}
                    keyboardShouldPersistTaps="handled"
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    input: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginRight: 10,
    },
    closeButton: { padding: 8 },
    closeText: { color: '#007AFF', fontSize: 16 },
    item: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemName: { fontSize: 16, fontWeight: '500' },
    itemAddress: { fontSize: 14, color: '#666', marginTop: 4 },
});
