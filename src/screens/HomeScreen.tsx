import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React from "react";
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen(): JSX.Element {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#a5c4ff', '#fcb69f']} 
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        <View style={styles.header}>
          <Text style={styles.title}>SUBAM CALENDARS</Text>
          <Text style={styles.subtitle}>KANGEYAM</Text>
          <Text style={styles.tagline}>Crafting Your Perfect Calendar</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require("../../assets/desk-calendar.png")}
          />
        </View>

        {/* --- THREE MAIN ACTIONS --- */}
        <View style={styles.actionArea}>
          {/* Orders landing */}
          <TouchableOpacity
            style={styles.buttonShadow}
            onPress={() => router.push('/orders')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6a82fb', '#4facfe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Feather name="copy" size={22} color="#fff" />
              <Text style={styles.buttonText}>Orders</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Employees */}
          <TouchableOpacity
            style={[styles.buttonShadow, { shadowColor: '#20c997', marginTop: 20 }]}
            onPress={() => router.push('/employee')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#20c997', '#2ab27b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Feather name="users" size={22} color="#fff" />
              <Text style={styles.buttonText}>Employees</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Expenditures */}
          <TouchableOpacity
            style={[styles.buttonShadow, { shadowColor: '#8e44ad', marginTop: 20 }]}
            onPress={() => router.push('/expenditures')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8e44ad', '#6a82fb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Feather name="credit-card" size={22} color="#fff" />
              <Text style={styles.buttonText}>Expenditures</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#1a253a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    color: '#485162',
    marginTop: 4,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: "#777",
    marginTop: 8,
  },
  imageContainer: {
    width: 200,
    height: 200, 
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 18,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  actionArea: {
    width: '100%',
    alignItems: 'center',
  },
  buttonShadow: {
    width: '90%',
    shadowColor: "#4facfe",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    borderRadius: 30,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: "#fff",
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    marginLeft: 10,
  },
});

