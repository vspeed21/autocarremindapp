import { StyleSheet, Text } from 'react-native';
import { ActivityIndicator, Modal, Portal } from 'react-native-paper';

interface OverlayProps {
  visible: boolean;
  message: string
  showSpinner?: boolean
}

function Overlay({ visible, message, showSpinner = true }: OverlayProps) {
  return (
    <Portal>
      <Modal
        visible={visible}
        style={styles.overlayContainer}
      >
        {showSpinner
          ?
          <ActivityIndicator />
          : null
        }
        <Text style={styles.messageStyle}>{message}</Text>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  messageStyle: {
    textAlign: 'center',
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  }
});

export default Overlay;
