import React from 'react';
import {
  Button,
  View,
  StyleSheet,
  ActivityIndicator,
  WebView,
  Platform,
  Text
} from 'react-native';
import {Asset, Location, Permissions} from 'expo';
import util from 'util';
import isValidCoordinates from 'is-valid-coordinates';
import uniqby from 'lodash.uniqby';

const MESSAGE_PREFIX = 'react-native-webview-leaflet';
const INDEX_FILE_PATH = `./dist/index.html`;
const INDEX_FILE_ASSET_URI = Asset.fromModule(require(INDEX_FILE_PATH)).uri;

export default class WebViewLeafletRouting extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mapLoaded: false,
      webviewErrorMessages: [],
      hasError: false,
      hasErrorMessage: '',
      hasErrorInfo: ''
    };
  }

  componentDidCatch(error, info) {
    this.setState({hasError: true, hasErrorMessage: error, hasErrorInfo: info});
  }

  componentDidUpdate = (prevProps, prevState) => {
    console.log(prevProps, prevState);

    // check that centerPosition prop exists,
    // that the current centerPosition does not equal the previous one,
    // and that the centerPosition is a valid lat, lng
    // if so, send a message to the map to update its current position
    if (this.props.centerPosition && this.props.centerPosition.length == 2 && prevProps.centerPosition !== this.props.centerPosition) {
      if (isValidCoordinates(this.props.centerPosition[1], this.props.centerPosition[0])) {
        console.log('****** sending centerPosition');
        this.sendMessage({centerPosition: this.props.centerPosition});
        // store the center position so that we can ensure the map gets it upon
        // its loading since it is possible that the position might
        // be availible before the map has been loaded
        this.setState({centerPosition: this.props.centerPosition});
      } else {
        console.warn('Invalid coordinates provided to centerPosition: ', this.props.centerPosition);
      }
    }

    // handle updates to own position
    if (this.props.ownPositionMarker && this.props.ownPositionMarker.coords && this.props.ownPositionMarker.coords.length === 2 && JSON.stringify(prevProps.ownPositionMarker) !== JSON.stringify(this.props.ownPositionMarker)) {
      if (isValidCoordinates(this.props.ownPositionMarker.coords[1], this.props.ownPositionMarker.coords[0])) {
        console.log('****** sending position');
        this.sendMessage({ownPositionMarker: this.props.ownPositionMarker});
        // store the own position so that we can ensure the map gets it upon
        // its loading since it is possible that the position might
        // be availible before the map has been loaded
        this.setState({ownPositionMarker: this.props.ownPositionMarker});
      } else {
        console.warn('Invalid coordinates provided to ownPositionMarker: ', this.props.ownPositionMarker.coords);
      }
    }

    // handle updates to urlRouter
    if (this.props.urlRouter && this.props.urlRouter !== prevProps.urlRouter) {
      console.log('****** sending urlRouter');
      this.sendMessage({urlRouter: this.props.urlRouter});
      // store the url routing so that we can ensure the map gets it upon
      // its loading since it is possible that the position might
      // be availible before the map has been loaded
      this.setState({urlRouter: this.props.urlRouter});
    }

    // handle updates to urlRouter
    if (this.props.mapLayer && this.props.mapLayer !== prevProps.mapLayer) {
      console.log('****** sending mapLayer');
      this.sendMessage({mapLayer: this.props.mapLayer});
      // store the map layer so that we can ensure the map gets it upon
      // its loading since it is possible that the position might
      // be availible before the map has been loaded
      this.setState({mapLayer: this.props.mapLayer});
    }

    // handle updates to routingMarkers
    if (this.props.routingMarkers && this.props.routingMarkers.from.length === 2 && this.props.routingMarkers.to.length === 2 && JSON.stringify(prevProps.routingMarkers) !== JSON.stringify(this.props.routingMarkers)) {
      if (isValidCoordinates(this.props.routingMarkers.from[1], this.props.routingMarkers.from[0]) && isValidCoordinates(this.props.routingMarkers.to[1], this.props.routingMarkers.to[0])) {
        console.log('****** sending routing');
        this.sendMessage({routingMarkers: this.props.routingMarkers});
        // store the routing so that we can ensure the map gets it upon
        // its loading since it is possible that the position might
        // be availible before the map has been loaded
        this.setState({routingMarkers: this.props.routingMarkers});
      } else {
        console.warn('Invalid coordinates provided to routingMarkers: ', this.props.routingMarkers);
      }
    }

    // actions to be performed one time immediately after the map
    // completes loading
    if (!prevState.mapLoaded && this.state.mapLoaded) {
      this.doPostMapLoadedActions();
    }
  };

  doPostMapLoadedActions = () => {
    // Here is our chance to send stuff to the map once it has loaded
    // Create an object that will have the update that the map will
    // get once it has loaded
    let onMapLoadedUpdate = {};

    // Check the state for any items that may have been received prior to
    // the map loading, and send them to the map
    // check if we have a center position
    if (this.props.centerPosition && this.props.centerPosition.length === 2 && isValidCoordinates(this.props.centerPosition[1], this.props.centerPosition[0])) {
      onMapLoadedUpdate = {
        ...onMapLoadedUpdate,
        centerPosition: this.props.centerPosition
      };
    }

    // do the same for ownPostionMarker
    if (this.props.ownPositionMarker && this.props.ownPositionMarker.coords && this.props.ownPositionMarker.coords.length == 2 && isValidCoordinates(this.props.ownPositionMarker.coords[1], this.props.ownPositionMarker.coords[0])) {
      onMapLoadedUpdate = {
        ...onMapLoadedUpdate,
        ownPositionMarker: this.props.ownPositionMarker
      };
    }

    // do the same for zoom
    if (this.props.zoom) {
      onMapLoadedUpdate = {
        ...onMapLoadedUpdate,
        zoom: this.props.zoom
      };
    }

    // do the same for map layer
    if (this.props.mapLayer) {
      onMapLoadedUpdate = {
        ...onMapLoadedUpdate,
        mapLayer: this.props.mapLayer
      };
    }

    if (Object.keys(onMapLoadedUpdate).length > 0) {
      this.sendMessage(onMapLoadedUpdate);
    }
  };

  // data to send is an object containing key value pairs that will be
  // spread into the destination's state
  sendMessage = (payload) => {
    if (!this.state.mapLoaded) {
      return console.log('map unloaded ! unable to send the message: ', payload);
    }

    // only send message when webview is loaded
    const message = JSON.stringify({prefix: MESSAGE_PREFIX, payload});

    console.log(`WebViewLeaflet: sending message: `, JSON.stringify(message));

    this.webview.postMessage(message, '*');
  };

  handleMessage = (data) => {
    let msgData = JSON.parse(data);

    if (msgData.hasOwnProperty('prefix') && msgData.prefix === MESSAGE_PREFIX) {
      console.log(`WebViewLeaflet: received message: `, msgData.payload);

      // if we receive an event, then pass it to the parent by calling
      // the parent function wtith the same name as the event, and passing
      // the entire payload as a parameter
      if (msgData.payload.event && this.props.eventReceiver.hasOwnProperty(msgData.payload.event)) {
        this.props.eventReceiver[msgData.payload.event](msgData.payload) // WebViewLeaflet will also need to know of some state changes, such as when the mapComponent is mounted;
      } else {
        this.props.eventReceiver.setState({
          state: {
            ...this.props.eventReceiver.state,
            mapState: {
              ...this.props.eventReceiver.mapState,
              ...msgData.payload
            }
          }
        });
      }
    }
  };

  doCenterMap = async () => {
    let centerPosition;
    let ownPositionMarker;

    try {
      if (!this.props.ownPositionMarker) {
        let {status} = await Permissions.askAsync(Permissions.LOCATION);

        if (status !== 'granted') {
          throw new Error('Permission to access location was denied');
        }

        const location = await Location.getCurrentPositionAsync({});

        centerPosition = [location.coords.latitude, location.coords.longitude];
        ownPositionMarker = {
          coords: centerPosition,
          icon: '❤️',
          size: [24, 24]
        };
      } else {
        centerPosition = this.props.ownPositionMarker.coords;
      }
    } catch (e) {
      console.log(e);
    } finally {
      this.sendMessage({centerPosition: centerPosition, ownPositionMarker: ownPositionMarker});
    }
  };

  validateLocations = (locations) => {
    // confirm the location coordinates are valid
    const validCoordLocations = locations.filter((location) => {
      return isValidCoordinates(location.coords[1], location.coords[0]);
    });

    // remove any locations that are already in the component state's 'locations'
    // create a new array containing all the locations
    let combinedArray = [
      ...this.state.locations,
      ...validCoordLocations
    ];

    // remove duplicate locations
    const deDupedLocations = uniqby(combinedArray, 'id');
    this.sendLocations(deDupedLocations);
    this.setState({locations: deDupedLocations});
  };

  onError = (error) => {
    this.setState({
      webviewErrorMessages: [
        ...this.state.webviewErrorMessages,
        error
      ]
    });
  };

  renderError = (error) => {
    this.setState({
      webviewErrorMessages: [
        ...this.state.webviewErrorMessages,
        error
      ]
    });
  };

  renderLoadingIndicator = () => {
    return (<View style={styles.activityOverlayStyle}>
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator size='large' animating={!this.props.eventReceiver.state.mapsState.mapLoaded}/>
      </View>
    </View>);
  };

  maybeRenderMap = () => {
    return (<WebView style={{
        ...StyleSheet.absoluteFillObject
      }}
      // ref
      ref={(ref) => this.webview = ref}
      // source
      source={Platform.OS === 'ios'
        ? require(INDEX_FILE_PATH)
        : {
          uri: INDEX_FILE_ASSET_URI
        }}
      // render loading handler
      renderLoading={this.renderLoading}
      // render error handler
      renderError={(error) => {
        console.log('RENDER ERROR: ', util.inspect(error, {
          showHidden: false,
          depth: null
        }));
      }}
      //options
      startInLoadingState={true} javaScriptEnabled={true} domStorageEnabled={true} scalesPageToFit={false} mixedContentMode={'always'}
      // message handler
      onMessage={(event) => {
        if (event && event.nativeEvent && event.nativeEvent.data) {
          this.handleMessage(event.nativeEvent.data);
        }
      }}
      // load start handler
      onLoadStart={() => console.log('WebView loading')}
      // load end handler
      onLoadEnd={() => {
        if (this.props.eventReceiver.hasOwnProperty('onLoad')) {
          this.props.eventReceiver.onLoad();
        }

        // Set the component state to showw that the map has been loaded.
        // This will let us do things during component update once the map
        // is loaded.
        this.setState({mapLoaded: true});

        console.log('WebView loaded');
      }}
      // error hadnler
      onError={(error) => {
        console.log('ERROR: ', util.inspect(error, {
          showHidden: false,
          depth: null
        }));
      }}/>);
  };

  maybeRenderWebviewError = () => {
    if (this.state.webviewErrorMessages.length > 0) {
      return (<View style={{
          zIndex: 2000,
          backgroundColor: 'orange',
          margin: 4
        }}>
        {
          this.state.webviewErrorMessages.map((errorMessage, index) => {
            return <Text key={index}>{errorMessage}</Text>;
          })
        }
      </View>);
    }
    return null;
  };

  maybeRenderErrorBoundaryMessage = () => {
    if (this.state.hasError) 
      return (<View style={{
          zIndex: 2000,
          backgroundColor: 'red',
          margin: 5
        }}>
        {
          util.inspect(this.state.webviewErrorMessages, {
            showHidden: false,
            depth: null
          })
        }
      </View>);
    return null;
  };

  renderCenterOnOwnPositionMarkerButton = () => {
    return (<View style={{
        position: 'absolute',
        right: 10,
        bottom: 20,
        padding: 10
      }}>
      <Button onPress={this.doCenterMap} title={'🎯'}/>
    </View>);
  };

  render() {
    return (<View style={{
        flex: 1
      }}>
      <View style={{
          ...StyleSheet.absoluteFillObject
        }}>
        {this.maybeRenderMap()}
        {this.maybeRenderErrorBoundaryMessage()}
        {this.maybeRenderWebviewError()}
        {this.renderCenterOnOwnPositionMarkerButton()}
      </View>
    </View>);
  }
}

const styles = StyleSheet.create({
  activityOverlayStyle: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, .5)',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 5
  },
  activityIndicatorContainer: {
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 50,
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 1.0
  }
});
