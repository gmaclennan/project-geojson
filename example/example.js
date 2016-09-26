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
