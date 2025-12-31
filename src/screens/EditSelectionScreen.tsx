import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function EditSelectionScreen(): JSX.Element {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={['#f8f9fa', '#e0eafc']} style={styles.gradientBackground}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          
          <View style={styles.navBar}>
            <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#485162" />
              <Text style={styles.navText}>Back</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.mainContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Edit Items</Text>
              <Text style={styles.tagline}>Select which category you want to edit</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.choiceButtonShadow} 
                activeOpacity={0.8}
                onPress={() => router.push('/editCustomizeOptions')}
              >
                <LinearGradient
                  colors={['#ffecd2', '#fcb69f']}
                  style={styles.choiceButton}
                >
                  <Feather name="edit" size={24} color="#a0522d" />
                  <Text style={[styles.choiceButtonText, { color: '#a0522d' }]}>Customize Design Options</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.choiceButtonShadow} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#d4e4ff', '#a5c4ff']}
                  style={styles.choiceButton}
                >
                  <Ionicons name="calendar-outline" size={24} color="#2952a3" />
                  <Text style={[styles.choiceButtonText, { color: '#2952a3' }]}>Readymade Mixed Design</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#1a253a',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: "#777",
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
  },
  choiceButtonShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    borderRadius: 20,
    marginBottom: 25,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  choiceButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    marginLeft: 15,
  },
  navBar: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#e0eafc',
    paddingHorizontal: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  navText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#485162',
    marginLeft: 8,
  },
});
