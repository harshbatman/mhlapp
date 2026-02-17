import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, ThemeType } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth, db } from '@/utils/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function TrackStatusScreen() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;
    const router = useRouter();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const q = query(
                collection(db, 'applications'),
                where('userId', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);
            const apps = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort by submittedAt in client-side to avoid composite index requirement
            apps.sort((a: any, b: any) => {
                const aTime = a.submittedAt?.toMillis?.() || 0;
                const bTime = b.submittedAt?.toMillis?.() || 0;
                return bTime - aTime; // desc order
            });
            setApplications(apps);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderApplicationItem = ({ item }: { item: any }) => {
        const statusColors: any = {
            'Pending': '#757575',
            'Approved': '#000000',
            'Rejected': '#000000',
            'In Review': '#9E9E9E'
        };

        return (
            <TouchableOpacity
                style={[styles.appCard, { backgroundColor: Colors[colorScheme].surface, borderColor: Colors[colorScheme].border }]}
                onPress={() => router.push({ pathname: '/loan-details', params: { id: item.id } })}
            >
                <View style={styles.cardHeader}>
                    <View>
                        <ThemedText style={styles.loanType}>{item.loanType}</ThemedText>
                        <ThemedText style={styles.loanId}>ID: {item.id.slice(0, 8).toUpperCase()}</ThemedText>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] || '#757575') + '20' }]}>
                        <ThemedText style={[styles.statusText, { color: statusColors[item.status] || '#757575' }]}>
                            {item.status}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <ThemedText style={styles.footerLabel}>Amount</ThemedText>
                        <ThemedText style={styles.footerValue}>₹{item.loanAmount}</ThemedText>
                    </View>
                    <View>
                        <ThemedText style={styles.footerLabel}>Tenure</ThemedText>
                        <ThemedText style={styles.footerValue}>{item.tenure} Years</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].tint} opacity={0.5} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000000" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Track Status</ThemedText>
                    <TouchableOpacity style={styles.backBtn} onPress={fetchApplications}>
                        <Ionicons name="refresh" size={20} color="#000000" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000000" />
                    <ThemedText style={{ marginTop: 15, opacity: 0.6 }}>Loading your applications...</ThemedText>
                </View>
            ) : applications.length > 0 ? (
                <FlatList
                    data={applications}
                    renderItem={renderApplicationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="document-text-outline" size={80} color={Colors[colorScheme].tint} style={{ opacity: 0.2 }} />
                        <View style={styles.badge}>
                            <Ionicons name="search" size={20} color="#FFFFFF" />
                        </View>
                    </View>

                    <ThemedText style={styles.emptyTitle}>No Applications Found</ThemedText>
                    <ThemedText style={styles.emptySubtitle}>
                        You haven&apos;t applied for any loans yet. Start your journey today!
                    </ThemedText>

                    <TouchableOpacity
                        style={styles.applyBtn}
                        onPress={() => router.push('/apply')}
                    >
                        <ThemedText style={styles.applyBtnText}>Apply Now</ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F6F6F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#000000',
        fontSize: 20,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        gap: 16,
    },
    appCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#00000010',
        paddingBottom: 15,
        marginBottom: 15,
    },
    loanType: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000000',
    },
    loanId: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 11,
        opacity: 0.5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footerValue: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#F6F6F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    badge: {
        position: 'absolute',
        bottom: 35,
        right: 35,
        backgroundColor: '#000000',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    applyBtn: {
        backgroundColor: '#000000',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    applyBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
