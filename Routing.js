import React from 'react';

import WebViewLeafletRouting from './WebViewLeafletRouting';

export default class Routing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      eventReceiver: props.eventReceiver,
      initialRegion: props.initialRegion,
      markers: [],
      mapLayer: null,
      ownPositionMarker: null,
      routingMarkers: null,
      centerPosition: null
    };
  }

  componentDidMount = () => {
    this.initMap();
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.ownPositionMarker && this.props.ownPositionMarker !== prevProps.ownPositionMarker) {
      this.setState({ownPositionMarker: this.props.ownPositionMarker, centerPosition: this.props.ownPositionMarker.coords});
    }

    if (this.props.markers && this.props.markers !== prevProps.markers) {
      this.setState({markers: this.props.markers});
    }
  };

  initMap = () => {
    let centerPosition = [45.72348047159787, 4.83214326115558];
    let {initialRegion, mapLayer, markers, ownPositionMarker} = this.props;

    if (initialRegion) {
      centerPosition = initialRegion;
    } else {
      if (ownPositionMarker) {
        centerPosition = ownPositionMarker.coords;
      }
    }

    if (!mapLayer) {
      mapLayer = {
        name: 'OpenStreetMap',
        type: 'TileLayer',
        url: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,
        attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      };
    }

    this.setState({mapLayer, centerPosition, markers, ownPositionMarker});
  };

  // get the routing
  getRouting = () => {
    const {urlRouter, from, to} = this.props;

    if (!from || !to) {
      return console.log('No coordinates for the routing');
    }

    this.setState({
      urlRouter,
      routingMarkers: {
        from: from,
        to: to
      }
    });
  };

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

  render() {
    const {
      mapLayer,
      initialRegion,
      centerPosition,
      ownPositionMarker,
      urlRouter,
      routingMarkers,
      markers
    } = this.state;

    return (<WebViewLeafletRouting
      // ref
      ref={component => this.webViewLeaflet = component}
      // event handler
      eventReceiver={this}
      // map layer
      mapLayer={mapLayer} initialRegion={initialRegion}
      // center position
      centerPosition={centerPosition}
      // own position
      ownPositionMarker={ownPositionMarker}
      // url router for routing
      urlRouter={urlRouter}
      // routing markers
      routingMarkers={routingMarkers}
      // markers
      markers={markers}/>);
  }
}
