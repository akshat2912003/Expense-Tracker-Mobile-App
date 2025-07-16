import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Slot, Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '@/contexts/authContext'

const StackLayout = () => {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen 
          name='(modals)/profileModal'
          options={{
            presentation: 'modal',
          }}
        />

        {/* wallet model */}
        <Stack.Screen 
          name='(modals)/walletModal'
          options={{
            presentation: 'modal',
          }}
        />
        
        {/* transaction model */}
        <Stack.Screen 
          name='(modals)/transactionModal'
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  )
}

const styles = StyleSheet.create({})