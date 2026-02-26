import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from 'react-native';
import { Vehicle } from '../types/Vehicle';

interface VehiclePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectVehicle: (vehicle: Vehicle) => void;
    currentVehicle: Vehicle;
}

const VEHICLE_TYPES = [
    { type: 'car', label: 'Car', icon: '🚗' },
    { type: 'suv', label: 'SUV', icon: '🚙' },
    { type: 'truck', label: 'Truck', icon: '🚚' },
    { type: 'rv', label: 'RV/Motorhome', icon: '🚐' },
    { type: 'van', label: 'Van', icon: '🚐' },
];

export const VehiclePickerModal: React.FC<VehiclePickerModalProps> = ({
    visible,
    onClose,
    onSelectVehicle,
    currentVehicle,
}) => {
    const [selectedType, setSelectedType] = useState(currentVehicle.type);
    const [height, setHeight] = useState(currentVehicle.height.toString());
    const [weight, setWeight] = useState(currentVehicle.weight.toString());
    const [width, setWidth] = useState(currentVehicle.width.toString());
    const [length, setLength] = useState(currentVehicle.length.toString());

    const handleSave = () => {
        const vehicle: Vehicle = {
            type: selectedType,
            height: parseFloat(height) || 2.0,
            weight: parseFloat(weight) || 2.0,
            width: parseFloat(width) || 2.0,
            length: parseFloat(length) || 5.0,
        };
        onSelectVehicle(vehicle);
        onClose();
    };

    const handleTypeSelect = (type: string) => {
        setSelectedType(type);
        // Set default dimensions based on vehicle type
        switch (type) {
            case 'car':
                setHeight('1.5');
                setWeight('1.5');
                setWidth('1.8');
                setLength('4.5');
                break;
            case 'suv':
                setHeight('1.8');
                setWeight('2.5');
                setWidth('2.0');
                setLength('5.0');
                break;
            case 'truck':
                setHeight('3.0');
                setWeight('10.0');
                setWidth('2.5');
                setLength('7.0');
                break;
            case 'rv':
                setHeight('3.5');
                setWeight('10.0');
                setWidth('2.5');
                setLength('9.0');
                break;
            case 'van':
                setHeight('2.5');
                setWeight('3.0');
                setWidth('2.0');
                setLength('5.5');
                break;
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Vehicle</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Vehicle Type Selection */}
                        <Text style={styles.sectionTitle}>Vehicle Type</Text>
                        <View style={styles.typeGrid}>
                            {VEHICLE_TYPES.map((vehicleType) => (
                                <TouchableOpacity
                                    key={vehicleType.type}
                                    style={[
                                        styles.typeCard,
                                        selectedType === vehicleType.type && styles.typeCardSelected,
                                    ]}
                                    onPress={() => handleTypeSelect(vehicleType.type)}
                                >
                                    <Text style={styles.typeIcon}>{vehicleType.icon}</Text>
                                    <Text
                                        style={[
                                            styles.typeLabel,
                                            selectedType === vehicleType.type && styles.typeLabelSelected,
                                        ]}
                                    >
                                        {vehicleType.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Vehicle Dimensions */}
                        <Text style={styles.sectionTitle}>Dimensions</Text>
                        <View style={styles.dimensionsGrid}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Height (m)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={height}
                                    onChangeText={setHeight}
                                    keyboardType="decimal-pad"
                                    placeholder="0.0"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Weight (tonnes)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="decimal-pad"
                                    placeholder="0.0"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Width (m)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={width}
                                    onChangeText={setWidth}
                                    keyboardType="decimal-pad"
                                    placeholder="0.0"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Length (m)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={length}
                                    onChangeText={setLength}
                                    keyboardType="decimal-pad"
                                    placeholder="0.0"
                                />
                            </View>
                        </View>

                        {/* Info Text */}
                        <Text style={styles.infoText}>
                            Vehicle dimensions help calculate safe routes with appropriate clearances
                            for bridges, tunnels, and weight restrictions.
                        </Text>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    closeButton: {
        fontSize: 24,
        color: '#6b7280',
        padding: 4,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
        marginTop: 8,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
        gap: 12,
    },
    typeCard: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    typeCardSelected: {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
    },
    typeIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    typeLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
        textAlign: 'center',
    },
    typeLabelSelected: {
        color: '#3b82f6',
        fontWeight: '600',
    },
    dimensionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    inputGroup: {
        width: '48%',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    infoText: {
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 18,
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    saveButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
