import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shopping List',
          tabBarIcon: ({ color }) => <TabIcon icon="🛒" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          title: 'Stores',
          tabBarIcon: ({ color }) => <TabIcon icon="🏪" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <span style={{ fontSize: 24, filter: color === '#6366f1' ? 'none' : 'grayscale(100%)' }}>
      {icon}
    </span>
  );
}
