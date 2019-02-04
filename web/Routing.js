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
    console.log(props);

    const {
      coords: {
        from,
        to
      },
      mapComponent
    } = this.props;

    return this.leafletElement = L.Routing.control({
      // router: new L.Routing.OSRMv1({serviceUrl: 'http://127.0.0.1:5000/route/v1'}),
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

      mapComponent.sendMessage({event: 'onRoutesFound', payload: e.routes});
    }).on('routeselected', e => {
      console.log(e);

      mapComponent.sendMessage({event: 'onRouteSelected', payload: e.route});
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
