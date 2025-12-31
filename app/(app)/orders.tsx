import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersScreen(): JSX.Element {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={['#a5c4ff', '#fcb69f']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.headerContainer}>
          <View style={{flexDirection:'row', alignItems:'center', gap:12}}>
            <TouchableOpacity onPress={() => router.push('/')} style={{padding:8}}><Feather name="arrow-left" size={20} color="#1a253a" /></TouchableOpacity>
            <Text style={styles.title}>Orders</Text>
          </View>
          <Text style={styles.subtitle}>Manage orders</Text>
        </View>

        <View style={styles.actionArea}>
          <TouchableOpacity style={styles.buttonShadow} onPress={() => router.push('/details')} activeOpacity={0.8}>
            <LinearGradient colors={['#6a82fb', '#4facfe']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
              <Feather name="plus-circle" size={22} color="#fff" />
              <Text style={styles.buttonText}>New Order</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.buttonShadow, { shadowColor: '#343a40', marginTop: 20 }]} onPress={() => router.push('/viewOrders')} activeOpacity={0.8}>
            <LinearGradient colors={['#6c757d', '#343a40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
              <Feather name="list" size={22} color="#fff" />
              <Text style={styles.buttonText}>View Orders</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.buttonShadow, { shadowColor: '#ffc107', marginTop: 20 }]} onPress={() => router.push('/editSelection')} activeOpacity={0.8}>
            <LinearGradient colors={['#ffc107', '#ff8f07']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
              <Feather name="edit" size={22} color="#fff" />
              <Text style={styles.buttonText}>Edit Item</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 30 },
  header: { alignItems: 'center' },
  title: { fontSize: 32, fontFamily: 'Poppins-Bold', color: '#1a253a', textAlign: 'center' },
  subtitle: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#485162', marginTop: 6 },
  actionArea: { width: '100%', alignItems: 'center' },
  buttonShadow: { width: '90%', shadowColor: '#4facfe', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 12, borderRadius: 30 },
  button: { paddingVertical: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  buttonText: { color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 18, marginLeft: 10 },
});
