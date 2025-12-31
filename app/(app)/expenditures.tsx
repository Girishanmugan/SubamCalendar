import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebaseConfig';

interface Expenditure {
  id: string;
  item?: string;
  amount?: number;
  vendor?: string;
  notes?: string;
  createdAt?: any;
}

export default function ExpendituresScreen(): JSX.Element {
  const [items, setItems] = useState<Expenditure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Expenditure | null>(null);
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
  // Search and date range filter
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(''); // expected YYYY-MM-DD
  const [endDate, setEndDate] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'start' | 'end'>('start');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    try {
      const q = query(collection(db, 'expenditures'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const list: Expenditure[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) } as Expenditure));
        setItems(list);
        setLoading(false);
      }, (err) => {
        console.error('Expenditures fetch error', err);
        setError('Failed to load expenditures.');
        setLoading(false);
      });
      return () => unsub();
    } catch (err) {
      console.error(err);
      setError('Failed to load expenditures.');
      setLoading(false);
    }
  }, []);

  const resetForm = () => { setItemName(''); setAmount(''); setVendor(''); setNotes(''); setEditing(null); };

  const openAdd = () => { resetForm(); setFormVisible(true); };

  const saveExpenditure = async () => {
    if (!itemName.trim()) { Alert.alert('Validation', 'Item name is required'); return; }
    const amt = Number(amount);
    if (!amt || amt <= 0) { Alert.alert('Validation', 'Enter a valid amount'); return; }
    try {
      await addDoc(collection(db, 'expenditures'), { item: itemName.trim(), amount: amt, vendor: vendor.trim() || null, notes: notes.trim() || null, createdAt: serverTimestamp() });
      setFormVisible(false);
      resetForm();
    } catch (err) {
      console.error('Save expenditure error', err);
      Alert.alert('Error', 'Could not save expenditure.');
    }
  };

  const confirmDelete = (it: Expenditure) => {
    Alert.alert('Delete', `Delete ${it.item || 'item'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteExpenditure(it) }
    ]);
  };

  const deleteExpenditure = async (it: Expenditure) => {
    try {
      await deleteDoc(doc(db, 'expenditures', it.id));
    } catch (err) {
      console.error('Delete expenditure error', err);
      Alert.alert('Error', 'Could not delete expenditure.');
    }
  };

  const renderItem = ({ item, index }: { item: Expenditure; index: number }) => {
    const date = item.createdAt && item.createdAt.toDate ? item.createdAt.toDate().toLocaleDateString('en-IN') : item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-IN') : '-';
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}><Text style={styles.cardLabel}>{index + 1}. {item.item}</Text><Text style={styles.cardText}>₹{(item.amount || 0).toString()}</Text></View>
        {item.vendor ? <Text style={styles.smallText}>Vendor: {item.vendor}</Text> : null}
        {item.notes ? <Text style={styles.smallText}>Notes: {item.notes}</Text> : null}
        <Text style={styles.smallText}>Date: {date}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteButton}><Feather name="trash-2" size={18} color="#fff" /></TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) return null;

  // helper to get millis from firestore timestamp or null
  const getMillis = (createdAt: any) => {
    if (!createdAt) return null;
    if (typeof createdAt.toDate === 'function') return createdAt.toDate().getTime();
    if (createdAt.seconds) return createdAt.seconds * 1000;
    return null;
  };

  const parseDateInput = (s: string) => {
    if (!s) return null;
    const parts = s.split('-');
    if (parts.length !== 3) return null;
    const [y, m, d] = parts.map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const applyFilters = () => {
    const sDate = parseDateInput(startDate);
    const eDate = parseDateInput(endDate);
    const startMillis = sDate ? sDate.getTime() : null;
    const endMillis = eDate ? new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate(), 23, 59, 59).getTime() : null;

    return items.filter((it) => {
      // search filter
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const hay = `${it.item || ''} ${it.vendor || ''} ${it.notes || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // date filter
      const m = getMillis(it.createdAt);
      if (startMillis && (!m || m < startMillis)) return false;
      if (endMillis && (!m || m > endMillis)) return false;

      return true;
    });
  };

  const filtered = applyFilters();

  // total within filtered results
  const total = useMemo(() => filtered.reduce((s, it) => s + (Number(it.amount || 0)), 0), [filtered]);

  const router = useRouter();

  // Calendar helpers
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

  const openCalendar = (mode: 'start' | 'end') => { setCalendarMode(mode); setCalendarVisible(true); };

  const setDateFromCalendar = (date: Date) => {
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (calendarMode === 'start') {
      // if endDate exists ensure start < end
      const e = parseDateInput(endDate);
      if (e && date.getTime() > e.getTime()) {
        Alert.alert('Invalid Range', 'Start date must be before end date');
        return;
      }
      setStartDate(formatted);
    } else {
      const s = parseDateInput(startDate);
      if (s && date.getTime() < s.getTime()) {
        Alert.alert('Invalid Range', 'End date must be after start date');
        return;
      }
      setEndDate(formatted);
    }
    setCalendarVisible(false);
  };

  const prevMonth = () => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  return (
    <LinearGradient colors={["#f8f9fa","#e0eafc"]} style={{flex:1}}>
      <SafeAreaView style={{flex:1}}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerContainer}>
          <View style={{flexDirection:'row', alignItems:'center', gap:12}}>
            <TouchableOpacity onPress={() => router.push('/')} style={{padding:8}}><Feather name="arrow-left" size={20} color="#1a253a" /></TouchableOpacity>
            <Text style={styles.title}>Expenditures</Text>
          </View>
          <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
            <Text style={styles.totalText}>Total: ₹{total}</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAdd}><Feather name="plus" size={20} color="#fff" /></TouchableOpacity>
          </View>
        </View>

        {loading ? <ActivityIndicator size="large" color="#6a82fb" style={{flex:1}} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error && (
          <>
            <View style={styles.filterRow}>
              <TextInput placeholder="Search item/vendor/notes" value={searchQuery} onChangeText={setSearchQuery} style={[styles.input, styles.searchInput]} />
            </View>

            <View style={styles.dateRow}>
              <TouchableOpacity style={[styles.input, styles.dateInput, styles.datePickerBtn]} onPress={() => openCalendar('start')}><Text style={{fontFamily:'Poppins-Regular'}}>{startDate || 'Start'}</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.input, styles.dateInput, styles.datePickerBtn]} onPress={() => openCalendar('end')}><Text style={{fontFamily:'Poppins-Regular'}}>{endDate || 'End'}</Text></TouchableOpacity>
            </View>

            <View style={styles.filterButtonsRow}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setStartDate(''); setEndDate(''); setSearchQuery(''); }}><Text style={styles.modalCancelText}>Clear</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={() => { /* filtered recalculated automatically */ }}><Text style={styles.modalSaveText}>Apply</Text></TouchableOpacity>
            </View>

            <FlatList data={filtered} renderItem={renderItem} keyExtractor={i => i.id} contentContainerStyle={{padding:12}} ListEmptyComponent={<Text style={styles.emptyText}>No expenditures found.</Text>} />
          </>
        )}

        <Modal visible={isFormVisible} animationType="slide" transparent={true} onRequestClose={() => setFormVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>{editing ? 'Edit' : 'Add Expenditure'}</Text>
                <TextInput placeholder="Item" value={itemName} onChangeText={setItemName} style={styles.input} />
                <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" />
                <TextInput placeholder="Vendor" value={vendor} onChangeText={setVendor} style={styles.input} />
                <TextInput placeholder="Notes" value={notes} onChangeText={setNotes} style={styles.input} />
              </ScrollView>
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => { setFormVisible(false); resetForm(); }}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalSave} onPress={saveExpenditure}><Text style={styles.modalSaveText}>Save</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Calendar Modal */}
        <Modal visible={calendarVisible} animationType="slide" transparent={true} onRequestClose={() => setCalendarVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, {maxHeight: 480}]}> 
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                <TouchableOpacity onPress={prevMonth} style={{padding:8}}><Feather name="chevron-left" size={20} color="#333" /></TouchableOpacity>
                <Text style={{fontFamily:'Poppins-Bold'}}>{calendarMonth.toLocaleString(undefined, {month:'long', year:'numeric'})}</Text>
                <TouchableOpacity onPress={nextMonth} style={{padding:8}}><Feather name="chevron-right" size={20} color="#333" /></TouchableOpacity>
              </View>

              {/* Weekday headings */}
              <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((wd) => (<Text key={wd} style={{width:30,textAlign:'center',fontFamily:'Poppins-Bold'}}>{wd}</Text>))}
              </View>

              {/* Days grid */}
              <View style={{marginTop:8}}>
                {(() => {
                  const first = startOfMonth(calendarMonth);
                  const offset = first.getDay();
                  const totalDays = daysInMonth(calendarMonth);
                  const rows: any[] = [];
                  let cells: any[] = [];
                  for (let i = 0; i < offset; i++) cells.push(null);
                  for (let d = 1; d <= totalDays; d++) {
                    cells.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d));
                    if (cells.length === 7) { rows.push(cells); cells = []; }
                  }
                  if (cells.length) { while (cells.length < 7) cells.push(null); rows.push(cells); }
                  return rows.map((r, ri) => (
                    <View key={ri} style={{flexDirection:'row', justifyContent:'space-between', marginVertical:6}}>
                      {r.map((c: Date | null, ci: number) => (
                        <TouchableOpacity key={ci} onPress={() => c && setDateFromCalendar(c)} style={{width:30,height:30,justifyContent:'center',alignItems:'center',borderRadius:4, backgroundColor: c ? '#fff' : 'transparent'}}>
                          <Text style={{fontFamily:'Poppins-Regular'}}>{c ? c.getDate() : ''}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ));
                })()}
              </View>

              <View style={{flexDirection:'row', justifyContent:'flex-end', marginTop:12}}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setCalendarVisible(false)}><Text style={styles.modalCancelText}>Close</Text></TouchableOpacity>
              </View>
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
});
