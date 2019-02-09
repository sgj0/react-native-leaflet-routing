import React from 'react';
import {Platform} from 'react-native';
import {Constants, Location, Permissions} from 'expo';

import WebViewLeafletRouting from './WebViewLeafletRouting';

export default class Routing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      eventReceiver: props.eventReceiver,
      errorMessages: [],
      currentLocation: [],
      mapLayer: null,
      ownPositionMarker: null,
      routingMarkers: null,
      centerPosition: []
    };
  }

  componentDidMount = () => {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      console.log('Oops, this will not work on Sketch in an Android emulator. Try it on your device!');
    } else {
      this.initMap();
    }
  }

  initMap = async () => {
    let centerPosition = [];
    let ownPositionMarker;

    try {
      const location = await this.getLocationAsync();
      console.log('current location', location);

      centerPosition = [location.coords.latitude, location.coords.longitude];
    } catch (e) {
      console.log(e);

      centerPosition = [48.85861640881589, 2.3510742187500004];

      this.setState({
        errorMessages: [
          ...this.state.errorMessages,
          e.message
        ]
      });
    } finally {
      this.setState({
        mapLayer: this.props.mapLayer,
        centerPosition: centerPosition,
        currentLocation: centerPosition,
        ownPositionMarker: {
          coords: centerPosition,
          icon: '❤️',
          size: [24, 24]
        }
      });
    }
  };

  // get the current location so that the map can be displayed
  getLocationAsync = async () => {
    let {status} = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    return await Location.getCurrentPositionAsync({});
  };

  // get the routing
  getRouting = () => {
    const {urlRouter, from, to} = this.props;

    this.setState({
      urlRouter,
      routingMarkers: {
        from: from,
        to: to
      }
    });
  }

  // send the event to parent component
  sendEvent = (name, event) => {
    const {eventReceiver} = this.state;

    if (name in eventReceiver) {
      eventReceiver[name](event);
    }
  };

  /*
    EVENT RECEIVED FROM THE MAP INTO THE WEBVIEW
  */
  onLoad = (event) => {
    this.sendEvent('onLoad', event);
  };

  onUnload = (event) => {
    this.sendEvent('onUnload', event);
  };

  onMapLoaded = (event) => {
    this.getRouting();

    this.sendEvent('onMapLoaded', event);
  };

  onUpdateMapState = (event) => {
    this.sendEvent('onUpdateMapState', event);
  };

  onMapClicked = (event) => {
    this.sendEvent('onMapClicked', event);
  };

  onMapMarkerClicked = (event) => {
    this.sendEvent('onMapMarkerClicked', event);
  };

  onZoom = (event) => {
    this.sendEvent('onZoom', event);
  };

  onZoomStart = (event) => {
    this.sendEvent('onZoomStart', event);
  };

  onZoomEnd = (event) => {
    this.sendEvent('onZoomEnd', event);
  };

  onZoomLevelsChange = (event) => {
    this.sendEvent('onZoomLevelsChange', event);
  };

  onMove = (event) => {
    this.sendEvent('onMove', event);
  };

  onMoveStart = (event) => {
    this.sendEvent('onMoveStart', event);
  };

  onMoveEnd = (event) => {
    this.sendEvent('onMoveEnd', event);
  };

  onCurrentPositionClicked = (event) => {
    this.sendEvent('onCurrentPositionClicked', event);
  };

  onResize = (event) => {
    this.sendEvent('onResize', event);
  };

  onViewReset = (event) => {
    this.sendEvent('onViewReset', event);
  };

  onRoutesFound = (event) => {
    this.sendEvent('onRoutesFound', event);
  };

  onRouteSelected = (event) => {
    this.sendEvent('onRouteSelected', event);
  };

  onRouteError = (event) => {
    this.sendEvent('onRouteError', event);
  };
  /*
    //////////////
  */

  // display the error messages
  renderErrors = () => {
    const errors = this.state.errorMessages;

    return errors.length
      ? errors.map((error, index) => {
        return (<Text key={index} style={{
            margin: 10
          }}>{error}</Text>);
      })
      : null;
  };

  render() {
    return (<WebViewLeafletRouting
      // ref
      ref={(component) => (this.webViewLeaflet = component)}
      // event handler
      eventReceiver={this}
      // map layer
      mapLayer={this.state.mapLayer}
      // center position
      centerPosition={this.state.centerPosition}
      // own position
      ownPositionMarker={this.state.ownPositionMarker}
      // url router for routing
      urlRouter={this.state.urlRouter}
      // routing markers
      routingMarkers={this.state.routingMarkers}/>);
  }
}
