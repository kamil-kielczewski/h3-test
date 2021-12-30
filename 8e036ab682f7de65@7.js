// https://observablehq.com/@nrabinowitz/mapbox-token@7
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Mapbox Token
Mapbox tokens are supposed to be rotated periodically when in public use. This notebook stores the current token to facilitate rotation across notebooks.
`
)});
  main.variable(observer("mapboxApiToken")).define("mapboxApiToken", function(){return(
'pk.eyJ1IjoibnJhYmlub3dpdHoiLCJhIjoiY2tmeWFhNW1nMWtmdTM0czkzYTV1c2M1ZCJ9.vTv6YYavFPRiCQJxfMfTsg'
)});
  return main;
}
