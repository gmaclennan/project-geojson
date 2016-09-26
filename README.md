# project-geojson


> Project GeoJSON files or a stream of GeoJSON or GeoJSON objects with proj4

You might not want to do this - the [latest GeoJSON spec](https://tools.ietf.org/html/rfc7946#section-4) expects all GeoJSON to be in WGS84 / `EPSG:4326`.

> However, where all involved parties have a prior arrangement, alternative coordinate reference systems can be used without risk of data being misinterpreted.

This might be useful if you want ["lie to leaflet"](http://content.stamen.com/natgeoamazonia) or such like hacks to trick web mapping tools to display data in different projections. Also useful if you are parsing `.shp` files that are in a different coordinate system.

## Table of Contents

<!-- MarkdownTOC -->

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Known Issues](#known-issues)
- [Contribute](#contribute)
- [License](#license)

<!-- /MarkdownTOC -->

## Install

```
npm install --save geojson-project
```

## Usage

```
project file.geojson --t_srs EPSG:3857

  Project `file.geojson` to Pseudo Mercator (`EPSG:3857`), outputs to stdout

project --t_srs EPSG:3857
project - --t_srs EPSG:3857

  Read input from stdin

options:

  -t, --t_srs <srs_def>   Destination projection, either a EPSG string or a proj4 string
  -s, --s_srs <srs_def>   Source projection, if omitted assumed to be `EPSG:4326`
  -o                      Output file, if omitted outputs to stdout
```

## API

```js
var projectStream = require('project-geojson')
```

### `var stream = projectStream([fromProjection,] toProjection)`

Returns a transform stream that expects GeoJSON as a string or buffer and will return GeoJSON. `fromProjection` and `toProjection` can be [proj](https://trac.osgeo.org/proj/wiki/GenParms) or [wkt](http://docs.opengeospatial.org/is/12-063r5/12-063r5.html#36) strings, or EPSG strings e.g. `EPSG:4326`. Uses [`epsg-to-proj`](https://www.npmjs.com/package/epsg-to-proj) to look up EPSG codes - you will need to provide the proj or wkt string if your EPSG code is not in that database. If `fromProjection` is omitted it is assumed to be `EPSG:4326`

### `var objStream = projectStream.obj([fromProjection,] toProjection)`

Returns and `objectMode` transform stream that expects and returns a stream of GeoJSON feature objects.

### Example

Project the USA to Albers USA and back to WGS84 but via Pseudo Mercator - a web mapping library that projects the geojson via Psuedo Mercator will unknowingly project it to Albers USA. (N.B. I found this approx. 3x faster than doing the same with ogr2ogr)

```js
#!/usr/bin/env node

var project = require('../')
var geojsonStream = require('geojson-stream')

var ALBERS = '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=37.5 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs '

var wgs84ToAlbersUSA = project.obj('EPSG:4326', ALBERS)
var psuedoMercToWgs84 = project.obj('EPSG:3857', 'EPSG:4326')

process.stdin
  .pipe(geojsonStream.parse())
  .pipe(wgs84ToAlbersUSA)
  .pipe(psuedoMercToWgs84)
  .pipe(geojsonStream.stringify())
  .pipe(process.stdout)
```

```sh
cd example
cat usa.geojson | node example.js > usa_albers.geojson
```

## Known Issues

It doesn't touch any `bbox` that might be defined on the GeoJSON, and doesn't touch any `crs`, which is no longer part of the current GeoJSON Spec.

## Contribute

PRs accepted.

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © Gregor MacLennan
