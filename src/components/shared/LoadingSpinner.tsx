import { ActivityIndicator, Text, View } from 'react-native';

interface Props {
  msg1: string
  msg2: string
  full?: boolean
}

function LoadingSpinner({ msg1, msg2, full = true }: Props) {
  return (
    <View style={{ flex: full ? 1 : undefined, justifyContent: 'center', alignItems: 'center' }}>
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
