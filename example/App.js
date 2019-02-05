import React from 'react';
import {StyleSheet, Text, View, Platform, Alert} from 'react-native';
import {Constants, Location, Permissions} from 'expo';

import WebViewLeaflet from 'react-native-leaflet-routing';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      currentLocation: [],
      ownPositionMarker: null,
      routingMarkers: null,
      mapCenterPosition: []
    };
  }

  componentDidMount = () => {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      console.log('Oops, this will not work on Sketch in an Android emulator. Try it on your device!');
    } else {
      this.getLocationAsync();
    }
  }

  getLocationAsync = async () => {
    try {
      let {status} = await Permissions.askAsync(Permissions.LOCATION);

      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log('current location', location);

      const currentLocation = [location.coords.latitude, location.coords.longitude];

      this.setState({
        mapCenterPosition: currentLocation,
        currentLocation: currentLocation,
        ownPositionMarker: {
          coords: currentLocation,
          icon: '❤️',
          size: [
            24, 24
          ],
          animation: {
            name: 'pulse',
            duration: '.5',
            delay: 0,
            interationCount: 'infinite'
          }
        }
      });

    } catch (e) {
      console.log(e);
    }
  };

  getRouting = () => {
    const from = [48.87541, 2.32555];
    const to = [48.85513, 2.38713];

    this.setState({
      routingMarkers: {
        from: from,
        to: to
      }
    });
  }

  showAlert = (title, body) => {
    Alert.alert(title, body, [
      {
        text: 'OK',
        onPress: () => console.log('OK Pressed')
      }
    ], {cancelable: false});
  };

  onMapClicked = ({payload}) => {
    console.log(`Map Clicked: app received: ${payload.coords}`);
    this.showAlert('Map Clicked', `Coordinates = ${payload.coords}`);
  };

  onMapMarkerClicked = ({payload}) => {
    console.log(`Marker Clicked: ${payload.id}`);
    this.showAlert('Marker Clicked', `Marker ID = ${payload.id}`);

    this.setState({
      clickedMarkerID: payload.id,
      markers: this.state.markers.map((location) => {
        if (location.id === payload.id) {
          return {
            ...location,
            icon: (location.icon = '✖️')
          };
        }
        return location;
      })
    });
  };

  onZoomLevelsChange = (event) => {
    console.log('onZoomLevelsChange received : ', event);
  };

  onResize = (event) => {
    console.log('onResize received : ', event);
  };

  onUnload = (event) => {
    console.log('onUnload received : ', event);
  };

  onViewReset = (event) => {
    console.log('onViewReset received : ', event);
  };

  onLoad = (event) => {
    console.log('onLoad received : ', event);
  };

  onZoomStart = (event) => {
    console.log('onZoomEnd received : ', event);
  };

  onMoveStart = (event) => {
    console.log('onMoveStart received : ', event);
  };

  onZoom = (event) => {
    console.log('onZoom received : ', event);
  };

  onMove = (event) => {
    console.log('onMove received : ', event);
  };

  onZoomEnd = (event) => {
    console.log('onZoomEnd received : ', event);
  };

  onMoveEnd = (event) => {
    console.log('onMoveEnd received : ', event);
  }

  onCurrentPositionClicked = (event) => {
    console.log('onCurrentPositionClicked received : ', event);
  };

  onMapLoaded = (event) => {
    console.log('onMapLoaded received : ', event);

    this.getRouting();
  };

  onUpdateMapState = (event) => {
    console.log('onUpdateMapState received : ', event);
  };

  onRoutesFound = (event) => {
    console.log('onRoutesFound received : ', event);
  }

  onRouteSelected = (event) => {
    console.log('onRouteSelected received : ', event);
  }

  renderWebView = () => {
    return !this.state.mapCenterPosition.length || !this.state.ownPositionMarker
      ? null
      : (<WebViewLeaflet ref={(component) => (this.webViewLeaflet = component)} eventReceiver={this} centerPosition={this.state.mapCenterPosition} ownPositionMarker={this.state.ownPositionMarker} routingMarkers={this.state.routingMarkers}/>);
  }

  render() {
    return (<View style={styles.container}>
      <View style={styles.statusBar}/>
      <Text style={{
          margin: 10,
          fontSize: 18,
          color: 'black'
        }}>
        react-native-leaflet-routing Demo
      </Text>

      {this.renderWebView()}
    </View>);
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00ffff',
    display: 'flex'
  },
  statusBar: {
    height: Constants.statusBarHeight
  }
});
