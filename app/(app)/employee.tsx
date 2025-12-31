import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, TextInput, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

interface Employee {
  id: string;
  name: string;
  mobile?: string;
  address?: string;
  accountNumber?: string;
  lastSalary?: number;
  lastSalaryAt?: any;
  [key: string]: any;
}

export default function EmployeeScreen(): JSX.Element {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormVisible, setFormVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const [isSalaryModalVisible, setSalaryModalVisible] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState('');
  const [selectedForSalary, setSelectedForSalary] = useState<Employee | null>(null);

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    try {
      const q = query(collection(db, 'employees'), orderBy('name'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Employee[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as any) } as Employee));
        setEmployees(list);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching employees', err);
        setError('Failed to load employees.');
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error(err);
      setError('Failed to load employees.');
      setLoading(false);
    }
  }, []);

  const resetForm = () => {
    setName('');
    setMobile('');
    setAddress('');
    setAccountNumber('');
    setEditingEmployee(null);
  };

  const openAdd = () => { resetForm(); setFormVisible(true); };

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name || '');
    setMobile(emp.mobile || '');
    setAddress(emp.address || '');
    setAccountNumber(emp.accountNumber || '');
    setFormVisible(true);
  };

  const saveEmployee = async () => {
    if (!name.trim()) { Alert.alert('Validation', 'Employee name is required'); return; }
    try {
      if (editingEmployee) {
        const ref = doc(db, 'employees', editingEmployee.id);
        await updateDoc(ref, { name: name.trim(), mobile: mobile.trim(), address: address.trim(), accountNumber: accountNumber.trim() });
      } else {
        await addDoc(collection(db, 'employees'), { name: name.trim(), mobile: mobile.trim(), address: address.trim(), accountNumber: accountNumber.trim(), createdAt: serverTimestamp() });
      }
      setFormVisible(false);
      resetForm();
    } catch (err) {
      console.error('Save employee error', err);
      Alert.alert('Error', 'Could not save employee.');
    }
  };

  const confirmDelete = (emp: Employee) => {
    Alert.alert('Delete Employee', `Are you sure you want to delete ${emp.name}? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEmployee(emp) }
    ]);
  };

  const deleteEmployee = async (emp: Employee) => {
    try {
      await deleteDoc(doc(db, 'employees', emp.id));
    } catch (err) {
      console.error('Delete employee error', err);
      Alert.alert('Error', 'Could not delete employee.');
    }
  };

  const openSalaryModal = (emp?: Employee) => {
    if (emp) setSelectedForSalary(emp);
    setSalaryAmount('');
    setSalaryModalVisible(true);
  };

  const saveSalaryPayment = async () => {
    if (!selectedForSalary) { Alert.alert('Select', 'Please select an employee.'); return; }
    const amt = Number(salaryAmount);
    if (!amt || amt <= 0) { Alert.alert('Validation', 'Enter a valid salary amount.'); return; }
    try {
      await addDoc(collection(db, 'salaryPayments'), { employeeId: selectedForSalary.id, amount: amt, paidAt: serverTimestamp(), paidBy: auth.currentUser ? auth.currentUser.uid : null });
      // update last salary on employee doc for quick display
      await updateDoc(doc(db, 'employees', selectedForSalary.id), { lastSalary: amt, lastSalaryAt: serverTimestamp() });
      setSalaryModalVisible(false);
      setSelectedForSalary(null);
      setSalaryAmount('');
    } catch (err) {
      console.error('Save salary error', err);
      Alert.alert('Error', 'Could not save salary payment.');
    }
  };

  const renderEmployee = ({ item, index }:{ item: Employee, index:number }) => {
    const lastPaid = item.lastSalaryAt && item.lastSalaryAt.toDate ? item.lastSalaryAt.toDate().toLocaleDateString('en-IN') : item.lastSalaryAt ? new Date(item.lastSalaryAt.seconds * 1000).toLocaleDateString('en-IN') : 'Never';
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}><Text style={styles.cardLabel}>{index + 1}. {item.name}</Text><Text style={styles.cardText}>₹{(item.lastSalary || 0).toString()}</Text></View>
        <Text style={styles.smallText}>Mobile: {item.mobile || '-'}</Text>
        <Text style={styles.smallText}>Account: {item.accountNumber || '-'}</Text>
        <Text style={styles.smallText}>Address: {item.address || '-'}</Text>
        <Text style={styles.smallText}>Last Paid: {item.lastSalary ? `${item.lastSalary} on ${lastPaid}` : 'Never'}</Text>

        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconButton}><Feather name="edit" size={18} color="#6a82fb" /></TouchableOpacity>
          <TouchableOpacity onPress={() => openSalaryModal(item)} style={styles.payButton}><Feather name="dollar-sign" size={16} color="#fff" /><Text style={styles.payButtonText}>Pay</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton}><Feather name="trash-2" size={18} color="#fff" /></TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient colors={["#f8f9fa","#e0eafc"]} style={{flex:1}}>
      <SafeAreaView style={{flex:1}}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Employees</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAdd}><Feather name="plus" size={20} color="#fff" /></TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator size="large" color="#6a82fb" style={{flex:1}} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error && (
          <FlatList data={employees} renderItem={renderEmployee} keyExtractor={item => item.id} contentContainerStyle={{padding:12}} ListEmptyComponent={<Text style={styles.emptyText}>No employees found.</Text>} />
        )}

        {/* Add / Edit Modal */}
        <Modal visible={isFormVisible} animationType="slide" transparent={true} onRequestClose={() => setFormVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</Text>
                <TextInput placeholder="Employee Name" value={name} onChangeText={setName} style={styles.input} />
                <TextInput placeholder="Mobile Number" value={mobile} onChangeText={setMobile} style={styles.input} keyboardType="phone-pad" />
                <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />
                <TextInput placeholder="Account Number" value={accountNumber} onChangeText={setAccountNumber} style={styles.input} />
              </ScrollView>
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => { setFormVisible(false); resetForm(); }}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={saveEmployee}><Text style={styles.modalSaveText}>Save</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Salary Modal */}
        <Modal visible={isSalaryModalVisible} animationType="slide" transparent={true} onRequestClose={() => setSalaryModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Pay Salary</Text>
              <Text style={{fontFamily:'Poppins-Regular', marginBottom:8}}>Employee:</Text>
              <TouchableOpacity style={styles.selectBox} onPress={() => { /* future: open select list - for now selectedForSalary is set when opened */ }}>
                <Text style={styles.cardLabel}>{selectedForSalary ? selectedForSalary.name : 'Select employee'}</Text>
              </TouchableOpacity>
              <TextInput placeholder="Amount" value={salaryAmount} onChangeText={setSalaryAmount} style={styles.input} keyboardType="numeric" />
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => { setSalaryModalVisible(false); setSelectedForSalary(null); setSalaryAmount(''); }}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={saveSalaryPayment}><Text style={styles.modalSaveText}>Save</Text></TouchableOpacity>
              </View>
              <Text style={{fontFamily:'Poppins-Regular', marginTop:12, color:'#666'}}>Tip: open Pay on an employee to auto-select them.</Text>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 },
  title: { fontSize: 26, fontFamily: 'Poppins-Bold', color: '#1a253a' },
  addButton: { backgroundColor: '#6a82fb', padding: 10, borderRadius: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.08, shadowRadius:5, elevation:3 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardLabel: { fontFamily: 'Poppins-Bold', color: '#333' },
  cardText: { fontFamily: 'Poppins-Regular', color: '#333' },
  smallText: { fontFamily: 'Poppins-Regular', color: '#666', marginTop: 4 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 },
  iconButton: { padding: 8, marginRight: 8 },
  payButton: { backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  payButtonText: { color: '#fff', fontFamily: 'Poppins-Bold', marginLeft: 6 },
  deleteButton: { backgroundColor: '#dc3545', padding: 8, borderRadius: 8 },
  emptyText: { textAlign: 'center', marginTop: 50, fontFamily: 'Poppins-Regular', color: '#777' },
  errorText: { textAlign: 'center', marginTop: 50, fontFamily: 'Poppins-Bold', color: '#dc3545' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxHeight: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#1a253a', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 10, padding: 12, marginBottom: 10, fontFamily: 'Poppins-Regular' },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalCancel: { backgroundColor: '#6c757d', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, flex: 1, marginRight: 8, alignItems: 'center' },
  modalCancelText: { color: '#fff', fontFamily: 'Poppins-Bold' },
  modalSave: { backgroundColor: '#6a82fb', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, flex: 1, marginLeft: 8, alignItems: 'center' },
  modalSaveText: { color: '#fff', fontFamily: 'Poppins-Bold' },
  selectBox: { borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 10, padding: 12, marginBottom: 10 },
});
