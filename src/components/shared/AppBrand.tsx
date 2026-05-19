import { Image, View } from 'react-native';



function AppBrand() {
  return (
    <View style={{ marginTop: 30 }}>

      <Image
        source={require('../../../assets/images/logoacr.png')}
        width={200}
        height={173}
        style={{ width: 200, height: 173, marginInline: 'auto' }}
      />

    </View>
  )
}

export default AppBrand;