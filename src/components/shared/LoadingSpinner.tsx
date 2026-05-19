import { ActivityIndicator, Text, View } from 'react-native';

interface Props {
  msg1: string
  msg2: string
}

function LoadingSpinner({ msg1, msg2 }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator
        color='blue'
        size={40}
        style={{ marginBottom: 12 }}
      />
      <Text style={{ fontSize: 12 }}>{msg1}</Text>
      <Text style={{ fontSize: 12 }}>{msg2}</Text>
    </View>
  )
}

export default LoadingSpinner;
