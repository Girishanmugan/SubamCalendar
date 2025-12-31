import { Stack } from 'expo-router';
import { OrderProvider } from '../../src/context/OrderContext';

// This layout file wraps all the main app screens.
// We wrap the entire stack with the OrderProvider so all screens 
// (like OrderSummaryScreen) can access the order details.
export default function AppLayout() {
  return (
    <OrderProvider>
      <Stack>
        {/* All screens in this stack will have no header */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="details" options={{ headerShown: false }} />
        <Stack.Screen name="designType" options={{ headerShown: false }} />
        <Stack.Screen name="customizeDesign" options={{ headerShown: false }} />
        <Stack.Screen name="customizeDesignQuantity" options={{ headerShown: false }} />
        <Stack.Screen name="orderSummary" options={{ headerShown: false }} />
        <Stack.Screen name="viewOrders" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="expenditures" options={{ headerShown: false }} />
        <Stack.Screen name="editCustomizeOptions" options={{ headerShown: false }} />
        <Stack.Screen name="editSelection" options={{ headerShown: false }} />
      </Stack>
    </OrderProvider>
  );
}

