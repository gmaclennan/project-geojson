#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var pump = require('pump')
var argv = require('minimist')(process.argv.slice(2), {
  t: 't_srs',
  h: 'help',
  s: 's_srs'
})

function usage (exit) {
  var out = exit === 1 ? process.stderr : process.stdout
  fs.createReadStream(path.join(__dirname, 'usage.txt')).pipe(out)
  process.exit(exit)
}

if (argv.h) {
  usage(0)
}

var ProjectStream = require('../')

var rs
if (argv._[0] === '-' || !argv._[0]) {
  rs = process.stdin
} else {
  rs = fs.createReadStream(argv._[0])
}

var ws
if (argv.o) {
  ws = fs.createWriteStream(argv.o)
} else {
  ws = process.stdout
}

if (!argv.t) {
  console.error('must specify destination projection with --t_srs <srs_def>')
  usage(1)
}

argv.s = argv.s || 'EPSG:4326'

pump(rs, ProjectStream(argv.s, argv.t), ws, function (err) {
  if (!err) return
  console.error(err)
  process.exit(1)
})
