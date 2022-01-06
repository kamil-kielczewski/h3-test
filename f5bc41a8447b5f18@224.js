// https://observablehq.com/@nrabinowitz/h3-hierarchical-non-containment@224
import define1 from "./8e036ab682f7de65@7.js";
import define2 from "./e00812b2248e981f@86.js";
import define3 from "./e93997d5089d7165@2303.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# H3 Hierarchical (Non)Containment

While H3 has a hierarchical relationship between cells at different resolutions, the hexagon cell shape doesn't allow for exact containment of a cell's descendants. Between each level, a fixed percentage of the children's area lies outside of the parent, and the same percentage of the parent's area is not included within its children. The margin of error is relatively stable across multiple resolutions. At > 2 resolutions finer than the parent, entire cells lie outside the parent's boundary.

This issue is an unavoidable consequence of using a hexagonal grid rather than a square one, a trade-off for the other advantages of using hexagons. You can find [more discussion of these tradeoffs in the docs](https://h3geo.org/docs/usecases).
`
)});

main.variable(observer("viewof initText")).define("viewof initText", ["html"], function(html)
{
  const defaultInit = '6';
  const fromUrl = decodeURIComponent(window.location.hash.slice(1));
  return html`<input type="text" style="font-size:1em; width:12em; height:2em; font-family:monospace;" value="${fromUrl || defaultInit}" />`
});
main.variable(observer("initText")).define("initText", ["Generators", "viewof initText"], (G, _) => G.input(_));

main.variable(observer("viewof longText")).define("viewof longText", ["html"], function(html)
{
  const defaultLong = '-122.45';
  const fromUrl = decodeURIComponent(window.location.hash.slice(1));
  return html`<input type="text" style="font-size:1em; width:12em; height:2em; font-family:monospace;" value="${fromUrl || defaultLong}" />`
});
main.variable(observer("longText")).define("longText", ["Generators", "viewof longText"], (G, _) => G.input(_));

main.variable(observer("viewof latText")).define("viewof latText", ["html"], function(html)
{
  const defaultLat = '37.75';
  const fromUrl = decodeURIComponent(window.location.hash.slice(1));
  return html`<input type="text" style="font-size:1em; width:12em; height:2em; font-family:monospace;" value="${fromUrl || defaultLat}" />`
});
main.variable(observer("latText")).define("latText", ["Generators", "viewof latText"], (G, _) => G.input(_));


main.variable(observer("viewof colorText")).define("viewof colorText", ["html"], function(html)
{
  const defaultColor = '#0000ff';
  const fromUrl = decodeURIComponent(window.location.hash.slice(1));
  return html`<input type="text" style="font-size:1em; width:12em; height:2em; font-family:monospace;" value="${fromUrl || defaultColor}" />`
});
main.variable(observer("colorText")).define("colorText", ["Generators", "viewof colorText"], (G, _) => G.input(_));

main.variable(observer("viewof opacityText")).define("viewof opacityText", ["html"], function(html)
{
  const defaultOpacity = '0.5';
  const fromUrl = decodeURIComponent(window.location.hash.slice(1));
  return html`<input type="text" style="font-size:1em; width:12em; height:2em; font-family:monospace;" value="${fromUrl || defaultOpacity}" />`
});
main.variable(observer("opacityText")).define("opacityText", ["Generators", "viewof opacityText"], (G, _) => G.input(_));

main.variable(observer("viewof childDepth")).define("viewof childDepth", ["slider"], function(slider){return(
slider({
  min: 0, 
  max: 5, 
  step: 1, 
  value: 1, 
  title: "Child Depth"
})
)});
  main.variable(observer("childDepth")).define("childDepth", ["Generators", "viewof childDepth"], (G, _) => G.input(_));
  main.variable(observer("viewof map")).define("viewof map", ["html","width","mapboxgl","config","invalidation"], function*(html,width,mapboxgl,config,invalidation)
{
  const container = html`<div style="height:850px;width:${width}">`;
  yield container; // Give the container dimensions.
  
  const map = container.value = new mapboxgl.Map({
    container,
    center: [config.lng, config.lat],
    zoom: config.zoom,
    style: 'mapbox://styles/mapbox/light-v9'
  });
  
  map.on('load', () => {
    container.value = map;
    container.dispatchEvent(new CustomEvent("input"));
  });
  
  invalidation.then(() => map.remove());
}
);
  main.variable(observer("map")).define("map", ["Generators", "viewof map"], (G, _) => G.input(_));
  main.variable(observer()).define(["hexagons","h3","parentRes","parent","outsideArea","html"], function(hexagons,h3,parentRes,parent,outsideArea,html)
{
  const outside = hexagons.filter(h3Index => {
    const bounds = h3.h3ToGeoBoundary(h3Index);
    return bounds.every(([lat, lng]) => h3.geoToH3(lat, lng, parentRes) !== parent)
  }).length;
  
  const parentArea = h3.cellArea(parent, h3.UNITS.km2);
  
  const fmtKm2 = (num) => num.toFixed(2) + ' km<sup>2</sup>';
  
  const details = {
    'Parent area': fmtKm2(parentArea),
    'Total child area': fmtKm2(hexagons.reduce(
      (sum, h3Index) => sum + h3.cellArea(h3Index, h3.UNITS.km2), 0
    )),
    'Child area outside parent': fmtKm2(outsideArea),
    'Child % outside parent': (outsideArea / parentArea * 100).toFixed(2) + '%',
    'Children inside parent': hexagons.length - outside,
    'Childen outside parent': outside
  };
  
  return html`
    <table style="width: 400px">
      ${Object.keys(details).map(k => html`
        <tr>
          <th style="padding-right: 2em; font-weight: bold">${k}</th>
          <td style="padding: 0.5em 0; text-align: right; font-variant-numeric: tabular-nums;">
            ${details[k]}
          </td>
        </tr>
      `)}
    </table>
  `
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`---`
)});
  main.variable(observer("parentRes")).define("parentRes", ["initText"], function(initText){return(
    parseInt(initText)
)});
  main.variable(observer("h3Resolution")).define("h3Resolution", ["parentRes","childDepth"], function(parentRes,childDepth){return(
parentRes + childDepth
)});
  main.variable(observer("parent")).define("parent", ["h3","config","parentRes"], function(h3,config,parentRes){return(
h3.geoToH3(config.lat, config.lng, parentRes)
)});
  main.variable(observer("hexagons")).define("hexagons", ["h3","parent","h3Resolution"], function(h3,parent,h3Resolution)
{
  return h3.h3ToChildren(parent, h3Resolution);
}
);
  main.variable(observer("config")).define("config", ["longText", "latText"], function(longText, latText){return(
{
  lat: parseFloat(latText),
  lng: parseFloat(longText),
  zoom: 10,
}
)});
  main.variable(observer()).define(["renderH3IndexesToMap","map","hexagons","parent","md", "colorText", "opacityText"], function(renderH3IndexesToMap,map,hexagons,parent,md, colorText, opacityText)
{
  renderH3IndexesToMap(map, 'hexes', hexagons, {'fill-color': colorText, 'fill-opacity': parseFloat(opacityText)});
  //renderH3IndexesToMap(map, 'parent', [parent], {'fill-color': 'red'});
  
  // Uncomment to double-check the difference
   /*renderMapLayer({
     map,
     id: 'outside',
     data: outsideDiff,
     type: 'fill',
     paint: {
       'fill-color': 'black',
       'fill-opacity': 0.4
     }
   });*/
  
  return md`*{map rendering logic}*`
}
);
  main.variable(observer("features")).define("features", ["geojson2h3","hexagons","parent"], function(geojson2h3,hexagons,parent){return(
{
  children: geojson2h3.h3SetToMultiPolygonFeature(hexagons),
  parent: geojson2h3.h3ToFeature(parent)
}
)});
  main.variable(observer("outsideDiff")).define("outsideDiff", ["geojson2h3","parent","hexagons","difference"], function(geojson2h3,parent,hexagons,difference)
{
  const parentFeature = geojson2h3.h3ToFeature(parent);
  return {
    type: 'FeatureCollection',
    features: hexagons.map(h3Index => difference(geojson2h3.h3ToFeature(h3Index), parentFeature))
      .filter(Boolean)
  }
}
);
  main.variable(observer("outsideArea")).define("outsideArea", ["getArea","outsideDiff"], function(getArea,outsideDiff){return(
getArea(outsideDiff) / 1e6
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Dependencies`
)});
  main.variable(observer("h3")).define("h3", ["require"], function(require){return(
require('h3-js')
)});
  const child1 = runtime.module(define1);
  main.import("mapboxApiToken", child1);
  const child2 = runtime.module(define2);
  main.import("renderH3IndexesToMap", child2);
  main.import("renderMapLayer", child2);
  main.import("h3ToGeoJSON", child2);
  main.variable(observer("mapboxgl")).define("mapboxgl", ["require","mapboxApiToken"], async function(require,mapboxApiToken)
{
  let mapboxgl = await require('mapbox-gl');
  mapboxgl.accessToken = mapboxApiToken;
  return mapboxgl;
}
);
  const child3 = runtime.module(define3);
  main.import("slider", child3);
  main.variable(observer("geojson2h3")).define("geojson2h3", ["require"], function(require){return(
require('https://bundle.run/geojson2h3')
)});
  main.variable(observer("difference")).define("difference", ["require"], function(require){return(
require('https://bundle.run/@turf/difference@6.0.1')
)});
  main.variable(observer("getArea")).define("getArea", ["require"], async function(require)
{
  const module = await require('https://bundle.run/@turf/area@6.0.1');
  return module.default;
}
);
  main.variable(observer()).define(["html"], function(html){return(
html`<link href='https://unpkg.com/mapbox-gl@0.43.0/dist/mapbox-gl.css' rel='stylesheet' />`
)});
  return main;
}
