# react-native-leaflet-routing
A React Native component using WebView to provide a Leaflet Routing.

## Overview
This package is based on :

- [reggie3/react-native-webview-leaflet](https://github.com/reggie3/react-native-webview-leaflet)

For the map :

- [Leaflet/Leaflet](https://github.com/Leaflet/Leaflet)
- [PaulLeCam/react-leaflet](https://github.com/PaulLeCam/react-leaflet)

For the routing :

- [perliedman/leaflet-routing-machine](https://github.com/perliedman/leaflet-routing-machine)

These packages have each a complete documentation that I recommend to read if you want to edit this component.

## Install
```bash
npm install --save react-native-leaflet-routing
```

## Usage
### Import
```js
import Routing from 'react-native-leaflet-routing';
```

### Render
```js
<Routing
  // required: coordinates of the starting point
  from={[latitude, longitude]}

  // required: coordinates of the arriving point
  to={[latitude, longitude]}

  // optional : event functions
  eventReceiver={eventReceiver}

  // optional: url of routing server
  urlRouter={urlRouter}/>
```

### Config
`latitude` and `longitude` are required numbers.

`eventReceiver` is an optional object :
```js
{
  onLoad: (event) => {},
  onUnload: (event) => {},
  onMapLoaded: (event) => {},
  onUpdateMapState: (event) => {},
  onMapClicked: (event) => {},
  onMapMarkerClicked: (event) => {},
  onZoom: (event) => {},
  onZoomStart: (event) => {},
  onZoomEnd: (event) => {},
  onZoomLevelsChange: (event) => {},
  onMove: (event) => {},
  onMoveStart: (event) => {},
  onMoveEnd: (event) => {},
  onCurrentPositionClicked: (event) => {},
  onResize: (event) => {},
  onViewReset: (event) => {},
  onRoutesFound: (event) => {},
  onRouteSelected: (event) => {},
  onRouteError: (event) => {}
}
```

`urlRouter` is an optional string.

## Demo
There is an react native app in the example/ folder.

## Debug

### Browser
You can debug the app in the browser. The source code is in the web/ folder. Feel free to edit it.

To launch the debug mode
```bash
npm run dev
```

To build the web app in order to use it in the WebView of your react-native app. The compiled source will be in the dist/ folder
```bash
npm run build
```

### Mobile
To launch expo
```bash
cd example/
npm run start
```

## Infos
To get your own routing server, please see the [Project ORSM](http://project-osrm.org/).

## Thanks
Special thanks to [reggie3](https://github.com/reggie3), [perliedman](https://github.com/perliedman), [PaulLeCam](https://github.com/PaulLeCam) and contributors to these projects for their great works.

## Licence
ISC © sgj0
