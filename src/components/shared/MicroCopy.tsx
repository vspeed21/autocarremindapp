import { StyleSheet, Text } from 'react-native';

interface Props {
  text: string
}

function MicroCopy({ text }: Props) {
  return (
    <Text style={styles.microcopy}>
      {text}
    </Text>
  )
}


const styles = StyleSheet.create({
  microcopy: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBlock: 8,
    marginInline: 2
  },
});

export default MicroCopy;
