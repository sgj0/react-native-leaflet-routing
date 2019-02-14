import React from 'react';
import {Platform, StyleSheet, Text, View, Alert} from 'react-native';
import {Constants, Location, Permissions} from 'expo';
import Routing from 'react-native-leaflet-routing';

import mapLayers from './mapLayers';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ownPositionMarker: null,
      from: [
        45.76488848662397, 4.836387634277344
      ],
      to: [
        45.749797729939175, 4.873380661010743
      ],
      urlRouter: 'http://127.0.0.1:5000/route/v1',
      mapLayer: mapLayers[0],
      markers: []
    };
  }

  componentDidMount = async () => {
    let centerPosition;
    let ownPositionMarker;

    try {
      if (Platform.OS === 'android' && !Constants.isDevice) {
        throw new Error('Not a device: simulator running');
      }

      const location = await this.getLocationAsync();
      console.log('current location', location);

      centerPosition = [location.coords.latitude, location.coords.longitude];
    } catch (e) {
      console.log(e);

      centerPosition = [45.72348047159787, 4.83214326115558];
    } finally {
      ownPositionMarker = {
        id: 'position',
        coords: centerPosition
      };

      this.setState({
        ownPositionMarker,
        markers: [
          {
            id: 'marker1',
            coords: [45.752432918044825, 4.841709136962891]
          }, {
            id: 'marker2',
            coords: [45.741891419102785, 4.870891571044922]
          }
        ]
      });

      setTimeout(() => {
        this.setState({
          markers: [
            ...this.state.markers, {
              id: 'marker3',
              coords: [
                45.750037297635515, 4.89269256591797
              ],
              icon: '❤️',
              size: [24, 24]
            }
          ]
        });
      }, 5000);
    }
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

  // get the current location
  getLocationAsync = async () => {
    let {status} = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    return await Location.getCurrentPositionAsync({});
  };

  render() {
    const {
      from,
      to,
      urlRouter,
      mapLayer,
      markers,
      ownPositionMarker
    } = this.state;
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
      <Text style={{
          margin: 10,
          fontSize: 18,
          color: 'black'
        }}>
        react-native-leaflet-routing
      </Text>

      <Routing
        // optional: map layer
        mapLayer={mapLayer}
        // optional: own position
        ownPositionMarker={ownPositionMarker}
        // optional: coordinates of the starting point
        from={from}
        // optional: coordinates of the arriving point
        to={to}
        // optional : event functions
        eventReceiver={eventReceiver}
        // optional: url of routing server
        urlRouter={urlRouter}
        // optional: markers
        markers={markers}/>
    </View>);
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  }
});
