// https://observablehq.com/@nrabinowitz/mapbox-utils@86
import define1 from "./8e036ab682f7de65@7.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Mapbox Utils`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Convenience helper for rendering a map layer`
)});
  main.variable(observer("viewof map")).define("viewof map", ["html","mapboxgl","renderMapLayer","geojson","invalidation"], function*(html,mapboxgl,renderMapLayer,geojson,invalidation)
{
  const container = html`<div style="height:300px;width:500px">`;
  yield container; // Give the container dimensions.
  const map = container.value = new mapboxgl.Map({
    container,
    center: [-122.5, 37.8],
    zoom: 9,
    style: 'mapbox://styles/mapbox/light-v9'
  });
  map.on('load', () => {
    renderMapLayer({
      map,
      id: 'bbox',
      data: geojson,
      type: 'fill',
      paint: {
        'fill-color': 'darkred',
        'fill-opacity': 0.5
      }
    });
  })
  invalidation.then(() => map.remove());
}
);
  main.variable(observer("map")).define("map", ["Generators", "viewof map"], (G, _) => G.input(_));
  main.variable(observer("renderMapLayer")).define("renderMapLayer", function(){return(
function renderMapLayer({map, id, data, type, paint = {}, layout = {}}) {
  const sourceId = `${id}-source`;
  const layerId = `${id}-layer`;
  
  let source = map.getSource(sourceId);
  
  // Add the source and layer if we haven't created them yet
  if (!source) {
    map.addSource(sourceId, {
      type: 'geojson',
      data
    });
    map.addLayer({
      id: layerId,
      source: sourceId,
      type,
      paint,
      layout
    });
    source = map.getSource(sourceId);
  }

  // Update the geojson data
  source.setData(data);
  
  // Update styles
  Object.keys(paint).forEach(key => {
    map.setPaintProperty(layerId, key, paint[key]);
  });
  Object.keys(layout).forEach(key => {
    map.setLayoutProperty(layerId, key, layout[key]);
  });
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Adjust polygons that cross the antimeridian so that they render correctly (in-place)`
)});
  main.variable(observer("fixTransmeridian")).define("fixTransmeridian", function()
{
  function fixTransmeridianCoord(coord) {
      const lng = coord[0];
      coord[0] = lng < 0 ? lng + 360 : lng;
  }

  function fixTransmeridianLoop(loop) {
      let isTransmeridian = false;
      for (let i = 0; i < loop.length; i++) {
          // check for arcs > 180 degrees longitude, flagging as transmeridian
          if (Math.abs(loop[0][0] - loop[(i + 1) % loop.length][0]) > 180) {
              isTransmeridian = true;
              break;
          }
      }
      if (isTransmeridian) {
          loop.forEach(fixTransmeridianCoord);
      }
  }

  function fixTransmeridianPolygon(polygon) {
      polygon.forEach(fixTransmeridianLoop);
  }

  function fixTransmeridian(feature) {
      const {type} = feature;
      if (type === 'FeatureCollection') {
          feature.features.map(fixTransmeridian);
          return;
      }
      const {type: geometryType, coordinates} = feature.geometry;
      switch (geometryType) {
          case 'LineString':
              fixTransmeridianLoop(coordinates);
              return;
          case 'Polygon':
              fixTransmeridianPolygon(coordinates);
              return;
          case 'MultiPolygon':
              coordinates.forEach(fixTransmeridianPolygon);
              return;
          default:
              throw new Error(`Unknown geometry type: ${geometryType}`);
      }
  }
  
  return fixTransmeridian;
}
);
  main.variable(observer("renderH3IndexesToMap")).define("renderH3IndexesToMap", ["h3ToGeoJSON","fixTransmeridian","renderMapLayer"], function(h3ToGeoJSON,fixTransmeridian,renderMapLayer){return(
function renderH3IndexesToMap(map, id, h3Indexes, paint=null, transmeridian=false) {
  const geojson = h3ToGeoJSON(h3Indexes);
  if (transmeridian) fixTransmeridian(geojson);
  renderMapLayer({
    map,
    id,
    data: geojson,
    type: 'fill',
    paint: {
      'fill-color': 'red',
      ...paint
    }
  });
}
)});
  main.variable(observer("h3ToGeoJSON")).define("h3ToGeoJSON", ["h3"], function(h3){return(
function h3ToGeoJSON(hexes) {
  return {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [...hexes].map(h3Index => [h3.h3ToGeoBoundary(h3Index, true)])
    }
  }
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Data`
)});
  main.variable(observer("geojson")).define("geojson", function(){return(
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -122.51541137695311,
              37.697404298539745
            ],
            [
              -122.35610961914062,
              37.697404298539745
            ],
            [
              -122.35610961914062,
              37.83473402375478
            ],
            [
              -122.51541137695311,
              37.83473402375478
            ],
            [
              -122.51541137695311,
              37.697404298539745
            ]
          ]
        ]
      }
    }
  ]
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`# Dependencies`
)});
  main.variable(observer("mapboxgl")).define("mapboxgl", ["require","mapboxApiToken"], async function(require,mapboxApiToken)
{
  let mapboxgl = await require('mapbox-gl@0.43.0');
  mapboxgl.accessToken = mapboxApiToken;
  return mapboxgl;
}
);
  main.variable(observer("h3")).define("h3", ["require"], function(require){return(
require('h3-js')
)});
  const child1 = runtime.module(define1);
  main.import("mapboxApiToken", child1);
  main.variable(observer()).define(["html"], function(html){return(
html`<link href='https://unpkg.com/mapbox-gl@0.43.0/dist/mapbox-gl.css' rel='stylesheet' />`
)});
  return main;
}
