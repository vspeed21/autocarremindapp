import { View } from 'react-native';

import { Skeleton } from 'moti/skeleton';

function SimpleSkeleton() {
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', marginBlock: 12 }}>
      <Skeleton height={150} width='95%' colorMode='light' show={true}>
      </Skeleton>
    </View>
  )
}

export default SimpleSkeleton;
