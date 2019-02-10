import React from 'react';
import {TileLayer, WMSTileLayer, ImageOverlay, VideoOverlay} from 'react-leaflet';

const RasterLayer = (props) => {
  if (!props.layer) {
    return null;
  }

  switch (props.layer.type) {
    case 'TileLayer':
      return (<TileLayer attribution={props.layer.attribution} url={props.layer.url} zIndex={props.layer.zIndex || 0} {...props}/>);

    case 'WMSTileLayer':
      return (<WMSTileLayer url={props.layer.url} layers={props.layer.layers} {...props}/>);

    case 'ImageOverlay':
      return (<ImageOverlay url={props.layer.url} bounds={props.layer.bounds} opacity={props.layer.opacity || 1} zIndex={props.layer.zIndex || 0} {...props}/>);

    case 'VideoOverlay':
      return (<VideoOverlay url={props.layer.url} bounds={props.layer.bounds} opacity={props.layer.opacity || 1} play={props.layer.play || true} zIndex={props.layer.zIndex || 0} {...props}/>);

    default:

  }

  return null;
};

export default RasterLayer;
