var epsg = require('epsg-to-proj')
var pumpify = require('pumpify')
var through2 = require('through2')
var proj4 = require('proj4')
var geojsonStream = require('geojson-stream')
var coordEach = require('@turf/meta').coordEach

module.exports = projectStream
module.exports.obj = objStream

function objStream (fromProjection, toProjection) {
  if (arguments.length === 1) {
    toProjection = fromProjection
    fromProjection = epsg[4326]
  }
  var from = epsgToProj(fromProjection)
  var to = epsgToProj(toProjection)

  if (!from) throw new Error('Unknown fromProjection:', from)
  if (!to) throw new Error('Unknown toProjection:', to)

  var forward = proj4(from, to).forward
  var count = 0

  return through2.obj(read, end)

  function project (coords) {
    var projectedCoords = forward(coords)
    coords[0] = projectedCoords[0]
    coords[1] = projectedCoords[1]
    if (typeof coords[2] === 'number') {
      coords[2] = projectedCoords[2]
    }
  }

  function read (feature, enc, next) {
    if (!feature || !feature.type || !feature.geometry) return next()
    count++
    try {
      coordEach(feature, project)
      next(null, feature)
    } catch (e) {
      next(e)
    }
  }

  function end (next) {
    if (count > 0) return next()
    next(new Error('No valid features found in GeoJSON'))
  }
}

function projectStream (fromProjection, toProjection) {
  var parser = geojsonStream.parse()
  var stringifier = geojsonStream.stringify()
  return pumpify(parser, objStream(fromProjection, toProjection), stringifier)
}

function epsgToProj (projection) {
  var m = projection.match(/^EPSG:(.*)/)
  if (!m) return projection
  var code = +m[1]
  if (epsg.hasOwnProperty(code)) {
    return epsg[code]
  } else {
    return null
  }
}
