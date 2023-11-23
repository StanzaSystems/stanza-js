import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { useStanzaContext } from '@getstanza/react-native';

let renderCount = 0;

const Main = () => {
  const context = useStanzaContext('main');
  return (
    <View style={styles.container}>
      <Text>Render count: {++renderCount}</Text>
      <Text>Stanza context: {JSON.stringify(context, undefined, 2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});

export default Main;
