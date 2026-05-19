import { StyleSheet } from 'react-native';

import { AutoSkeletonView } from 'react-native-auto-skeleton';

import { Text } from 'react-native-paper';

function SimpleSkeleton() {
  return (
    <AutoSkeletonView isLoading={true}>
      <Text>HOLA</Text>
    </AutoSkeletonView>
  )
}


const styles = StyleSheet.create({});

export default SimpleSkeleton
