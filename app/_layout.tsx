import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

function HistoryButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push('/history')} style={{ marginRight: 16 }}>
      <Text style={{ fontSize: 22 }}>🗂️</Text>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f0f1a' },
          headerTintColor: '#f7fafc',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0f0f1a' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'MDConverter',
            headerShown: true,
            headerRight: () => <HistoryButton />,
          }}
        />
        <Stack.Screen
          name="preview"
          options={{
            title: 'Converted',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            title: 'History',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}
