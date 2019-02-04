import React from 'react';
import {Map, TileLayer, Marker} from 'react-leaflet';
import L from 'leaflet';
import isValidCoordinates from 'is-valid-coordinates';
import util from 'util';

import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import './app.css';

import Routing from './Routing';

const MESSAGE_PREFIX = 'react-native-webview-leaflet';
const SHOW_DEBUG_INFORMATION = WEBPACK_ENV === 'developement';
const ENABLE_BROWSER_TESTING = WEBPACK_ENV === 'developement';

class MapComponent extends React.Component {
  constructor(props) {
    super(props);

    this.mapRef = null;
    this.state = {
      loaded: false,
      zoom: 13,
      ownPositionMarker: props.ownPositionMarker,
      routingMarkers: null,
      centerPosition: [],
      debugMessages: []
    };
  }

  componentDidMount = () => {
    // add event listeners
    if (document) {
      document.addEventListener('message', this.handleMessage);

      this.printElement('using document');
    } else if (window) {
      window.addEventListener('message', this.handleMessage);

      this.printElement('using window');
    } else {
      return console.log('unable to add event listener');
    }

    // debug mode for web browser
    if (ENABLE_BROWSER_TESTING) {
      const centerPosition = [48.88658, 2.28741];
      const from = [48.87541, 2.32555];
      const to = [48.85513, 2.38713];

      this.setState({
        centerPosition: centerPosition,
        ownPositionMarker: {
          coords: centerPosition,
          icon: '❤️',
          size: [24, 24]
        },
        routingMarkers: {
          from: from,
          to: to
        }
      });
    }
  };

  componentWillUnmount = () => {
    if (document) {
      document.removeEventListener('message', this.handleMessage);
    } else if (window) {
      window.removeEventListener('message', this.handleMessage);
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.centerPosition !== prevState.centerPosition) {
      this.printElement(`updating centerPosition to ${this.state.centerPosition}`);
    }

    if (this.state.routingMarkers !== prevState.routingMarkers) {
      this.printElement(`updating routingMarkers to ${JSON.stringify(this.state.routingMarkers)}`);
    }
  };

  // print passed information in an html element; useful for debugging since console.log and debug statements won't work in a conventional way
  printElement = (data) => {
    if (!SHOW_DEBUG_INFORMATION) {
      return;
    }

    let message = '';

    if (typeof data === 'object') {
      message = util.inspect(data, {
        showHidden: false,
        depth: null
      });
    } else if (typeof data === 'string') {
      message = data;
    }

    this.setState({
      debugMessages: [
        ...this.state.debugMessages,
        message
      ]
    }, () => console.log(message));
  };

  // create a leaflet icon
  createDivIcon = (location) => {
    return L.divIcon({
      className: 'clearMarkerContainer',
      html: `<div style='font-size: ${Math.max(location.size[0], location.size[1])}px'>
          ${location.icon}
          </div>`,
      iconAnchor: location.iconAnchor || null
    });;
  };

  // data to send is an object containing key value pairs that will be spread into the destination's state
  sendMessage = (payload) => {
    const message = JSON.stringify({prefix: MESSAGE_PREFIX, payload: payload});

    try {
      if (document.hasOwnProperty('postMessage')) {
        document.postMessage(message, '*');
      } else if (window.hasOwnProperty('postMessage')) {
        window.postMessage(message, '*');
      } else {
        throw new Error(`unable to find postMessage`);
      }

      this.printElement(`message sent: ${message}`);
    } catch (error) {
      this.printElement(`error sending message: ${JSON.stringify(error)}`);
    }
  };

  // handle the received messages from the WebView
  handleMessage = (event) => {
    try {
      let msgData = JSON.parse(event.data);

      if (msgData.hasOwnProperty('prefix') && msgData.prefix === MESSAGE_PREFIX) {
        this.printElement(`Received message: ${JSON.stringify(msgData)}`);

        this.setState({
          ...this.state,
          ...msgData.payload
        });
      }
    } catch (err) {
      this.printElement(`leafletReactHTML error: ${err}`);
      return;
    }
  };

  // handle the map events
  onMapEvent = (event, payload) => {
    if (!this.mapRef) {
      return;
    }

    const mapCenterPosition = [this.mapRef.leafletElement.getCenter().lat, this.mapRef.leafletElement.getCenter().lng];
    const mapBounds = this.mapRef.leafletElement.getBounds();
    const mapZoom = this.mapRef.leafletElement.getZoom();

    if (!payload) {
      payload = {
        center: mapCenterPosition,
        bounds: mapBounds,
        zoom: mapZoom
      };
    }

    this.printElement(`onMapEvent: event = ${event}, payload = ${JSON.stringify(payload)}`);

    this.sendMessage({event, payload});

    // update the map's center in state if it has moved
    // The map's center in state (centerPosition) is used by react.leaflet
    // to center the map.  Centering the map component on the actual
    // map center will allow us to recenter the map by updating the centerPosition
    // item in state ourself
    if (event === 'onMoveEnd') {
      this.setState({centerPosition: mapCenterPosition});
    }

    if (event === 'onZoomEnd') {
      this.setState({zoom: mapZoom});
    }
  };

  // display the own position marker
  renderMarkerOwnPosition = () => {
    const ownPositionMarker = this.state.ownPositionMarker;

    if (!ownPositionMarker || !this.state.loaded) {
      return null;
    }

    const divIcon = this.createDivIcon(ownPositionMarker);

    return (<Marker position={ownPositionMarker.coords} icon={divIcon} onClick={() => console.log('ownPositionMarker clicked')}/>);
  };

  // display the routing
  renderRouting = () => {
    const routingMarkers = this.state.routingMarkers;

    if (!routingMarkers || !this.state.loaded) {
      return null;
    }

    return (<Routing coords={routingMarkers} mapComponent={this}/>);
  };

  // display error messages
  renderDebugInfos = () => {
    return SHOW_DEBUG_INFORMATION
      ? (<div style={{
          backgroundColor: 'orange',
          maxHeight: '150px',
          width: '100%',
          overflow: 'auto',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2000
        }} id='messages'>
        <ul style={{
            margin: 0,
            padding: '5px 20px'
          }}>
          {
            this.state.debugMessages.map((message, index) => {
              return <li key={index}>{message}</li>;
            })
          }
        </ul>
      </div>)
      : null
  };

  // display the map
  renderMap = () => {
    return !this.state.ownPositionMarker
      ? (<div>waiting on own position</div>)
      : (<Map ref={ref => this.mapRef = ref} center={this.state.centerPosition} maxZoom={18} zoom={this.state.zoom} whenReady={() => {
          this.setState({
            loaded: true
          }, () => {
            this.printElement(`******* map loaded *******`);
            this.onMapEvent('onMapLoaded', null);
          });
        }} onClick={(event) => {
          this.onMapEvent('onMapClicked', {
            coords: [event.latlng.lat, event.latlng.lng]
          });
        }} onZoomLevelsChange={() => {
          this.onMapEvent('onZoomLevelsChange', null);
        }} onResize={() => {
          this.onMapEvent('onResize', null);
        }} onZoomStart={() => {
          this.onMapEvent('onZoomStart', null);
        }} onMoveStart={() => {
          this.onMapEvent('onMoveStart', null);
        }} onZoom={() => {
          this.onMapEvent('onZoom', null);
        }} onMove={() => {
          this.onMapEvent('onMove', null);
        }} onZoomEnd={() => {
          this.onMapEvent('onZoomEnd', null);
        }} onMoveEnd={() => {
          this.onMapEvent('onMoveEnd', null);
        }} onUnload={() => {
          this.onMapEvent('onUnload', null);
        }} onViewReset={() => {
          this.onMapEvent('onViewReset', null);
        }}>
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'></TileLayer>
        {this.renderMarkerOwnPosition()}
        {this.renderRouting()}
      </Map>);
  }

  render() {
    return (<div style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'lightblue'
      }}>
      {this.renderMap()}
      {this.renderDebugInfos()}
    </div>)
  }
}

export default MapComponent;
