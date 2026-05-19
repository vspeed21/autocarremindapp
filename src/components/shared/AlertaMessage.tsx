import { StyleSheet } from 'react-native';

import { Text } from 'react-native-paper';

interface Props {
  alerta: {
    error: boolean
    message: string
  }
}

function AlertaMessage({ alerta }: Props) {
  return alerta.message ? (
    <Text style={[styles.message, alerta.error ? styles.messageError : styles.messageSucces]}>{alerta.message}</Text>
  ) : null;
}

const styles = StyleSheet.create({
  message: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginBlock: 12,
    marginInline: 4,
  },
  messageSucces: {
    color: 'green',
  },
  messageError: {
    color: 'red',
  }
});

export default AlertaMessage;
