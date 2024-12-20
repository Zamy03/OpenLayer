import Map from 'https://cdn.skypack.dev/ol/Map.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import {easeIn, easeOut} from 'https://cdn.skypack.dev/ol/easing.js';
import {fromLonLat} from 'https://cdn.skypack.dev/ol/proj.js';

const jakarta = fromLonLat([106.8456, -6.2088]);
const kyoto = fromLonLat([135.7681, 35.0116]);
const istanbul = fromLonLat([28.9744, 41.0128]);
const paris = fromLonLat([2.3522, 48.8566]);
const tokyo = fromLonLat([139.6917, 35.6895]);

const view = new View({
  center: istanbul,
  zoom: 6,
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      preload: 4,
      source: new OSM(),
    }),
  ],
  view: view,
});

// A bounce easing method (from https://github.com/DmitryBaranovskiy/raphael).
function bounce(t) {
  const s = 7.5625;
  const p = 2.75;
  let l;
  if (t < 1 / p) {
    l = s * t * t;
  } else {
    if (t < 2 / p) {
      t -= 1.5 / p;
      l = s * t * t + 0.75;
    } else {
      if (t < 2.5 / p) {
        t -= 2.25 / p;
        l = s * t * t + 0.9375;
      } else {
        t -= 2.625 / p;
        l = s * t * t + 0.984375;
      }
    }
  }
  return l;
}

// An elastic easing method (from https://github.com/DmitryBaranovskiy/raphael).
function elastic(t) {
  return (
    Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1
  );
}

function onClick(id, callback) {
  document.getElementById(id).addEventListener('click', callback);
}

onClick('rotate-left', function () {
  view.animate({
    rotation: view.getRotation() + Math.PI / 2,
  });
});

onClick('rotate-right', function () {
  view.animate({
    rotation: view.getRotation() - Math.PI / 2,
  });
});

onClick('rotate-around-paris', function () {
  // Rotation animation takes the shortest arc, so animate in two parts
  const rotation = view.getRotation();
  view.animate(
    {
      rotation: rotation + Math.PI,
      anchor: paris,
      easing: easeIn,
    },
    {
      rotation: rotation + 2 * Math.PI,
      anchor: paris,
      easing: easeOut,
    },
  );
});

onClick('pan-to-jakarta', function () {
  view.animate({
    center: jakarta,
    duration: 2000,
  });
});

onClick('elastic-to-kyoto', function () {
  view.animate({
    center: kyoto,
    duration: 2000,
    easing: elastic,
  });
});

onClick('bounce-to-istanbul', function () {
  view.animate({
    center: istanbul,
    duration: 2000,
    easing: bounce,
  });
});

onClick('spin-to-paris', function () {
  // Rotation animation takes the shortest arc, so animate in two parts
  const center = view.getCenter();
  view.animate(
    {
      center: [
        center[0] + (paris[0] - center[0]) / 2,
        center[1] + (paris[1] - center[1]) / 2,
      ],
      rotation: Math.PI,
      easing: easeIn,
    },
    {
      center: paris,
      rotation: 2 * Math.PI,
      easing: easeOut,
    },
  );
});

function flyTo(location, done) {
  const duration = 2000;
  const zoom = view.getZoom();
  let parts = 2;
  let called = false;
  function callback(complete) {
    --parts;
    if (called) {
      return;
    }
    if (parts === 0 || !complete) {
      called = true;
      done(complete);
    }
  }
  view.animate(
    {
      center: location,
      duration: duration,
    },
    callback,
  );
  view.animate(
    {
      zoom: zoom - 1,
      duration: duration / 2,
    },
    {
      zoom: zoom,
      duration: duration / 2,
    },
    callback,
  );
}

onClick('fly-to-tokyo', function () {
  flyTo(tokyo, function () {});
});

function tour() {
  const locations = [jakarta, tokyo, paris, kyoto, istanbul];
  let index = -1;
  function next(more) {
    if (more) {
      ++index;
      if (index < locations.length) {
        const delay = index === 0 ? 0 : 750;
        setTimeout(function () {
          flyTo(locations[index], next);
        }, delay);
      } else {
        alert('Tour complete');
      }
    } else {
      alert('Tour cancelled');
    }
  }
  next(true);
}

onClick('tour', tour);

map
