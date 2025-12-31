import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrder } from '../context/OrderContext'; // 1. Import the hook

export default function CustomerDetailsScreen(): JSX.Element {
  const router = useRouter();
  const { updateOrderDetails } = useOrder(); // 2. Get the update function

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
  });

  const handleNextPress = () => {
    const newErrors: { name?: string; phone?: string; address?: string } = {};
    
    if (!name.trim()) newErrors.name = 'Full Name is required.';
    if (!phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!address.trim()) newErrors.address = 'Full Address is required.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // 3. Save data to context before navigating
      updateOrderDetails({
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
      });
      router.push('/designType');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient 
      colors={['#a5c4ff', '#fcb69f']} 
      style={styles.gradientBackground}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.container}>
            <View>

              <View style={styles.navBar}>
              <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="#485162" />
                <Text style={styles.navText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={handleNextPress}>
                <Text style={styles.navText}>Next</Text>
                <Feather name="arrow-right" size={24} color="#485162" />
              </TouchableOpacity>
            </View>
            
              <Text style={styles.title}>Customer Details</Text>
              <Text style={styles.tagline}>Please fill in your information below</Text>
              
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Feather name="user" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    placeholderTextColor="#999"
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                <View style={styles.inputContainer}>
                  <Feather name="phone" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

                <View style={styles.inputContainer}>
                  <Feather name="map-pin" size={20} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Full Address"
                    value={address}
                    onChangeText={(text) => {
                      setAddress(text);
                      if (errors.address) setErrors({ ...errors, address: undefined });
                    }}
                    placeholderTextColor="#999"
                    multiline
                  />
                </View>
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
              </View>
            </View>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#1a253a',
    textAlign: 'center',
    marginTop: 40,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputIcon: {
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#333',
    paddingVertical: 15,
    paddingRight: 15,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#d9534f',
    marginTop: 4,
    marginLeft: 10,
  },
  navBar: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
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
    marginHorizontal: 8,
  },
});

