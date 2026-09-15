import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Icon } from 'react-native-paper'

interface Props {
  icon: {
    source: string
    color?: string
    size?: number
  }
  message1: string
  message2?: string
  titleColor?: string
  subtitleColor?: string
}

function PlaceholderView({ icon = { color: '#1D4ED8', size: 180, source: '' }, message1, message2, titleColor = '#0F2A5C', subtitleColor = '#5B6B7F' }: Props) {
  return (
    <View style={styles.container}>

      <View style={styles.iconBadge}>
        <Icon
          size={icon.size ? icon.size : 120}
          source={icon.source}
          color={icon.color ?? '#1D4ED8'}
        />
      </View>

      <Text style={[styles.message1, { color: titleColor }]}>
        {message1}
      </Text>

      <Text style={[styles.message2, { color: subtitleColor }]}>
        {message2}
      </Text>

    </View>
  )
}

export default PlaceholderView

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconBadge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  message1: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    color: '#0F2A5C',
  },
  message2: {
    fontSize: 14,
    color: '#5B6B7F',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  }
});
