import { View, Text, StyleSheet, Image, LogBox } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Home() {

  // const router = useRouter();
  // useEffect(() =>{
  //   setTimeout(() => {
  //     router.push('/(auth)/welcome')
  //   }, 200)
  // }, [])

  return (
    <View style={styles.container}>
      <Image 
        style={styles.logo}
        resizeMode='contain'
        source={require('../assets/images/splashImage.png')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo:{
    height: "20%",
    aspectRatio: 1,
  }
});
