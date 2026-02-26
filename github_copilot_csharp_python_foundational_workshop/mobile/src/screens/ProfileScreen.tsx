import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { getVersionInfo } from '../constants/version';

export const ProfileScreen = () => {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                },
            },
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Profile Header */}
                <View style={styles.header}>
                    {user?.picture ? (
                        <Image source={{ uri: user.picture }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0).toUpperCase() || '?'}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.name}>{user?.name || 'User'}</Text>
                    <Text style={styles.email}>{user?.email || 'No email'}</Text>
                    
                    {/* Guest Badge */}
                    {user?.email?.includes('@guest.roadtrip.app') && (
                        <View style={styles.guestBadge}>
                            <Text style={styles.guestBadgeText}>👤 Guest Mode</Text>
                        </View>
                    )}
                </View>

                {/* Guest Upgrade Prompt */}
                {user?.email?.includes('@guest.roadtrip.app') && (
                    <View style={styles.upgradePrompt}>
                        <Text style={styles.upgradeTitle}>🔒 Sign in to save your trips</Text>
                        <Text style={styles.upgradeText}>
                            Guest data may be deleted after 48 hours. Sign in with Google to keep your trips forever!
                        </Text>
                        <TouchableOpacity style={styles.upgradeButton}>
                            <Text style={styles.upgradeButtonText}>Sign In with Google</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Profile Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.option}>
                        <Text style={styles.optionText}>Edit Profile</Text>
                        <Text style={styles.optionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option}>
                        <Text style={styles.optionText}>Saved Trips</Text>
                        <Text style={styles.optionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option}>
                        <Text style={styles.optionText}>Preferences</Text>
                        <Text style={styles.optionArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>

                    <TouchableOpacity style={styles.option}>
                        <Text style={styles.optionText}>Help Center</Text>
                        <Text style={styles.optionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option}>
                        <Text style={styles.optionText}>Privacy Policy</Text>
                        <Text style={styles.optionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option}>
                        <Text style={styles.optionText}>Terms of Service</Text>
                        <Text style={styles.optionArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={styles.version}>{getVersionInfo()}</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
    },
    header: {
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    avatarPlaceholder: {
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#6b7280',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 24,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    optionText: {
        fontSize: 16,
        color: '#1f2937',
    },
    optionArrow: {
        fontSize: 24,
        color: '#9ca3af',
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        marginHorizontal: 24,
        marginTop: 32,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 12,
        marginTop: 24,
        marginBottom: 32,
    },
    guestBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
    },
    guestBadgeText: {
        color: '#92400e',
        fontSize: 12,
        fontWeight: '600',
    },
    upgradePrompt: {
        backgroundColor: '#eff6ff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    upgradeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e40af',
        marginBottom: 8,
    },
    upgradeText: {
        fontSize: 14,
        color: '#1e40af',
        lineHeight: 20,
        marginBottom: 12,
    },
    upgradeButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    upgradeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
