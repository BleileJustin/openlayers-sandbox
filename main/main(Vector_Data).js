import DragAndDrop from 'ol/interaction/DragAndDrop';
import Draw from 'ol/interaction/Draw';
import GeoJSON from 'ol/format/GeoJSON';
import Link from 'ol/interaction/Link';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import colormap from 'colormap';
import {Fill, Stroke, Style} from 'ol/style';
import {Map, View} from 'ol';
import {fromLonLat} from 'ol/proj';
import {getArea} from 'ol/sphere';

const min = 1e8;
const max = 2e13;
const steps = 50;
const ramp = colormap({
  colormap: 'blackbody',
  nshades: steps,
});

const clamp = (value, low, high) => {
  return Math.max(low, Math.min(value, high));
};

const getColor = (feature) => {
  const area = getArea(feature.getGeometry());
  const f = Math.pow(clamp((area - min) / (max - min), 0, 1), 1 / 2);
  const index = Math.round(f * (steps - 1));
  return ramp[index];
};

const source = new VectorSource();
const layer = new VectorLayer({
  source: source,
  style: function (feature) {
    return new Style({
      fill: new Fill({
        color: getColor(feature),
      }),
      stroke: new Stroke({
        color: 'rgba(255,255,255,0.8)',
      }),
    });
  },
});

const map = new Map({
  target: 'map-container',
  view: new View({
    center: fromLonLat([0, 0]),
    zoom: 2,
  }),
});

const clear = document.getElementById('clear');
clear.addEventListener('click', function () {
  source.clear();
});

const format = new GeoJSON({
  featureProjection: 'EPSG:3857',
});

const download = document.getElementById('download');
source.on('change', function () {
  const features = source.getFeatures();
  const json = format.writeFeatures(features);
  download.href =
    'data:application/json;charset=utf-8,' + encodeURIComponent(json);
});

map.addInteraction(new Link());
map.addLayer(layer);
map.addInteraction(
  new DragAndDrop({
    source: source,
    formatConstructors: [GeoJSON],
  })
);
map.addInteraction(
  new Modify({
    source: source,
  })
);
map.addInteraction(
  new Draw({
    type: 'Polygon',
    source: source,
  })
);
map.addInteraction(
  new Snap({
    source: source,
  })
);
