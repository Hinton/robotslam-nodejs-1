const express = require('express');
const yaml = require('js-yaml');
const ros = require('../modules/ros');
const models = require('../models/index');

const router = express.Router();

router.param('map', function (req, res, next, id) {
  models.map
    .findById(id)
    .then((map) => {
      req.map = map;
      next();
    })
    .catch((err) => {
      next(new Error('Failed to load map'));
    });
});

router.get('/:map_id', async function (req, res) {
  //noinspection JSUnresolvedVariable,JSUnresolvedFunction
  const map = await models.map.find({
    where: {
      id: req.params.map_id
    },
    include: [models.measurement]
  });

  if (!map) {
    return res.status(404).render('404');
  }

  res.render('maps/view', {
    title: 'Map',
    map: map,
    active: ros.active,
  });
});

router.get('/:map/update', function (req, res) {
  res.render('maps/fit_on_map', {
    title: 'Fit on map',
    map: req.map,
    gps_references: req.map.references
  });
});

router.post('/:map', async function (req, res) {

  if (req.body.coordinates) {
    const coordinates = JSON.parse(req.body.coordinates);

    req.map.update({
      ref_topleft: {
        type: 'point',
        coordinates: [coordinates.topleft.lat, coordinates.topleft.lng]
      },
      ref_topright: {
        type: 'point',
        coordinates: [coordinates.topright.lat, coordinates.topright.lng]
      },
      ref_bottomleft: {
        type: 'point',
        coordinates: [coordinates.bottomleft.lat, coordinates.bottomleft.lng]
      },
    });
  } else {
    req.map.update({
      name: req.body.name,
      floor: req.body.floor
    });
  }

  res.redirect('/maps/' + req.map.id);
})
;

router.get('/:map/yaml', async function (req, res) {
  const map = req.map;

  const output = {
    image: map.name + '.pgm',
    resolution: round(map.resolution),
    origin: map.origin,
    negate: 0,
    occupied_thresh: 0.65,
    free_tresh: 0.196
  };

  res.set('Content-Type', 'text/plain');
  res.send(yaml.safeDump(output));
});

router.get('/:map/toggle', async(req, res) => {
  if (ros.active) {
    ros.stop();
  } else {
    ros.measurement(req.map);
  }

  res.redirect(`/maps/${req.map.id}`);
});

function round(number) {
  return Math.round(number * 1e2) / 1e2;
}

module.exports = router;
