import MapboxVectorLayer from 'ol/layer/MapboxVector';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Map, View} from 'ol';
import {Stroke, Style} from 'ol/style';
import {fromLonLat} from 'ol/proj';
import Feature from 'ol/Feature';
import {fromExtent} from 'ol/geom/Polygon';

const map = new Map({
  target: 'map-container',
  view: new View({
    center: fromLonLat([0, 0]),
    zoom: 2,
  }),
});

const source = new VectorSource();
new VectorLayer({
  map: map,
  source: source,
  style: new Style({
    stroke: new Stroke({
      color: 'red',
      width: 4,
    }),
  }),
});

const layer = new MapboxVectorLayer({
  styleUrl:
    'https://api.maptiler.com/maps/bright/style.json?key=lirfd6Fegsjkvs0lshxe',
  // or, instead of the above, try
  // styleUrl: 'mapbox://styles/mapbox/bright-v9',
  // accessToken: 'Your token from https://mapbox.com/'
});
map.addLayer(layer);

map.on('pointermove', function (event) {
  source.clear();
  map.forEachFeatureAtPixel(
    event.pixel,
    function (feature) {
      const geometry = feature.getGeometry();
      source.addFeature(new Feature(fromExtent(geometry.getExtent())));
    },
    {
      hitTolerance: 2,
    }
  );
});
