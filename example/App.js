import React from 'react';
import {StyleSheet, Text, View, Alert} from 'react-native';
import {Constants} from 'expo';

import mapLayers from './mapLayers';
import Routing from 'react-native-leaflet-routing';

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  // display an alert
  showAlert = (title, body) => {
    Alert.alert(title, body, [
      {
        text: 'OK',
        onPress: () => console.log('OK Pressed')
      }
    ], {cancelable: false});
  };

  render() {
    const from = [48.87541, 2.32555];
    const to = [48.85513, 2.38713];
    const urlRouter = 'http://127.0.0.1:5000/route/v1';
    const eventReceiver = {
      onLoad: (event) => {
        console.log('onLoad received : ', event);
      },

      onUnload: (event) => {
        console.log('onUnload received : ', event);
      },

      onMapLoaded: (event) => {
        console.log('onMapLoaded received : ', event);
      },

      onUpdateMapState: (event) => {
        console.log('onUpdateMapState received : ', event);
      },

      onMapClicked: (event) => {
        console.log('onMapClicked received : ', event);
        this.showAlert('Map Clicked', `Coordinates = ${event.payload.coords}`);
      },

      onMapMarkerClicked: (event) => {
        console.log('onMapMarkerClicked received : ', event);
      },

      onZoom: (event) => {
        console.log('onZoom received : ', event);
      },

      onZoomStart: (event) => {
        console.log('onZoomEnd received : ', event);
      },

      onZoomEnd: (event) => {
        console.log('onZoomEnd received : ', event);
      },

      onZoomLevelsChange: (event) => {
        console.log('onZoomLevelsChange received : ', event);
      },

      onMove: (event) => {
        console.log('onMove received : ', event);
      },

      onMoveStart: (event) => {
        console.log('onMoveStart received : ', event);
      },

      onMoveEnd: (event) => {
        console.log('onMoveEnd received : ', event);
      },

      onCurrentPositionClicked: (event) => {
        console.log('onCurrentPositionClicked received : ', event);
      },

      onResize: (event) => {
        console.log('onResize received : ', event);
      },

      onViewReset: (event) => {
        console.log('onViewReset received : ', event);
      },

      onRoutesFound: (event) => {
        console.log('onRoutesFound received : ', event);
      },

      onRouteSelected: (event) => {
        console.log('onRouteSelected received : ', event);
      },

      onRouteError: (event) => {
        console.log('onRouteError received : ', event);
      }
    };

    return (<View style={styles.container}>
      <View style={styles.statusBar}/>
      <Text style={{
          margin: 10,
          fontSize: 18,
          color: 'black'
        }}>
        react-native-leaflet-routing
      </Text>

      <Routing
        // required: map layer
        mapLayer={mapLayers[0]}
        // required: coordinates of the starting point
        from={from}
        // required: coordinates of the arriving point
        to={to}
        // optional : event functions
        eventReceiver={eventReceiver}
        // optional: url of routing server
        urlRouter={urlRouter}/>
    </View>);
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  statusBar: {
    height: Constants.statusBarHeight
  }
});
