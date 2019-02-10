import {MapLayer} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

class Routing extends MapLayer {
  constructor(...args) {
    super(...args);

    this.state = {
      leaflet: args[1]
    }
  }

  componentWillMount() {
    super.componentWillMount();
  }

  componentWillReceiveProps({coords}) {
    const {props} = this;

    if (coords !== props.coords) {
      this.setWaypoints(coords);
    }
  }

  createLeafletElement(props) {
    const {
      coords: {
        from,
        to
      },
      mapComponent,
      urlRouter
    } = this.props;

    return this.leafletElement = L.Routing.control({
      router: urlRouter
        ? new L.Routing.OSRMv1({serviceUrl: urlRouter})
        : null,
      position: 'topright',
      waypoints: [
        L.latLng({lat: from[0], lng: from[1]}),
        L.latLng({lat: to[0], lng: to[1]})
      ],
      collapsible: true,
      show: false,
      showAlternatives: true,
      altLineOptions: {
        styles: [
          {
            color: 'black',
            opacity: 0.15,
            weight: 9
          }, {
            color: 'white',
            opacity: 0.8,
            weight: 6
          }, {
            color: 'violet',
            opacity: 1,
            weight: 2
          }
        ]
      }
    }).on('routesfound', e => {
      console.log(e);

      // make the app know that somes routes has been found
      mapComponent.onMapEvent('onRoutesFound', e.routes);
    }).on('routeselected', e => {
      console.log(e);

      // make the app know that a route has been selected
      mapComponent.onMapEvent('onRouteSelected', e.route);
    }).on('routingerror', e => {
      console.log(e);

      // make the app know that an error has been occured
      mapComponent.onMapEvent('onRouteError', e.error);
    }).addTo(this.state.leaflet.map);
  }

  updateLeafletElement(fromProps, toProps) {
    // console.log(fromProps, toProps);
  }

  setWaypoints({from, to}) {
    this.leafletElement.getPlan().setWaypoints([L.latLng(from), L.latLng(to)]);
  }

  render() {
    return null;
  }
}

export default Routing;
