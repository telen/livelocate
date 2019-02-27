/* global $ */

import d3map from './d3map';

const self = {};

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight;

const particles = [];

const bgcanvas = document.createElement('canvas');
const canvas = document.createElement('canvas');
const offCanvas = document.createElement('canvas');
const offCtx = offCanvas.getContext('2d');

let bgctx;
let context;

bgcanvas.id = 'bgcanvas';
canvas.id = 'canvas';
document.getElementById('graph').appendChild(bgcanvas);
document.getElementById('graph').appendChild(canvas);


function windowResizeHandler() {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight;
  bgctx.canvas.width = SCREEN_WIDTH;
  bgctx.canvas.height = SCREEN_HEIGHT;
  context.canvas.width = SCREEN_WIDTH;
  context.canvas.height = SCREEN_HEIGHT;
  offCtx.canvas.width = SCREEN_WIDTH;
  offCtx.canvas.height = SCREEN_HEIGHT;
}

if (canvas && canvas.getContext) {
  context = canvas.getContext('2d');
  bgctx = bgcanvas.getContext('2d');
  context.globalCompositeOperation = 'destination-over';
  window.addEventListener('resize', windowResizeHandler, false);
  windowResizeHandler();
}


// ===== settings =====
self.dotSize = 1.5;
function gsdotSize(v) {
  if (!arguments.length) return self.dotSize;
  self.dotSize = v;
  return self.dotSize;
}

self.rotate = false;
function transformMap(value) {
  if (value) {
    $('#graph').css('transform', 'rotateX(45deg)');
  } else {
    $('#graph').css('transform', 'rotateX(0deg)');
  }
}

self.wtDot = 4;
function gswtDot(v) {
  if (!arguments.length) return self.wtDot;
  self.wtDot = v;
  return self.wtDot;
}

function toggleBgFade(value) {
  if (!arguments.length) return self.bgFadeTimer;
  self.bgFadeTimer = value;
  return self.bgFadeTimer;
}
// =====================

/**
     *
     * @param xy [x, y]
     * @constructor
     */
function Dot(xy) {
  this.xy = xy;

  this.radius = 1;
  this.alpha = +(0.5 * Math.random()).toFixed(1);
  this.birth = +new Date();
  this.life = 10 * 1000; // seconds
  this.alphaFade = 0.05;
  this.driection = 1;

  this.gradientLength = 2;
  this.gradientLengthSpeed = 0.05;
  this.gradientDirection = -1;

  this.color = function rgbaColor() {
    return `rgba(0, 229, 229, ${this.alpha})`;
  };
}


$(d3map.g).on('zoom', () => {
  bgcanvas.width = bgcanvas.width;
  offCanvas.width = offCanvas.width;

  for (let i = 0; i < particles.length; i++) {
    particles[i].xy = d3map.projection(particles[i].latlng);
  }
});

function drawProcess() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const now = new Date().getTime();
    if ((now - particles[i].birth) > particles[i].life) { // dots life expire, moving to background canvas.
      particles[i].alpha = 0.9;
      bgctx.fillStyle = particles[i].color();
      bgctx.fillRect(particles[i].xy[0], particles[i].xy[1], gsdotSize(), gsdotSize());

      particles.splice(i, 1);
    } else if (particles[i].choosen) {
      context.fillStyle = `rgba(245,255,255, ${1})`;
      context.fillRect(particles[i].xy[0],
        particles[i].xy[1],
        particles[i].gradientLength,
        particles[i].gradientLength);

      if (particles[i].gradientLength <= 1) {
        particles[i].gradientDirection = 1;
      } else if (particles[i].gradientLength >= gswtDot()) {
        particles[i].gradientDirection = -1;
      }

      particles[i].gradientLength
        += particles[i].gradientDirection * particles[i].gradientLengthSpeed;
    } else {
      context.fillStyle = particles[i].color();
      context.fillRect(particles[i].xy[0], particles[i].xy[1], gsdotSize(), gsdotSize());

      if (particles[i].alpha >= 2) {
        particles[i].direction = -1;
      } else if (particles[i].alpha <= 0.4) {
        particles[i].direction = 1;
      }

      particles[i].alpha += particles[i].direction * particles[i].alphaFade;
    }
  }
}

/**
     * Add a alpha to background canvas every xx seconds, fading the background dots.
     */
self.bgFadeTimer = true;
function bgFade() {
  const bgImgData = bgctx.getImageData(0, 0, bgcanvas.width, bgcanvas.height);
  offCtx.putImageData(bgImgData, 0, 0);

  bgcanvas.width = bgcanvas.width;
  bgcanvas.globalCompositeOperation = 'source-out';
  bgctx.globalAlpha = 0.9;
  bgctx.drawImage(offCtx.canvas, 0, 0);
  bgctx.globalAlpha = 1;


  if (toggleBgFade()) {
    setTimeout(bgFade, 10 * 1000);
  }
}

function loop() {
  canvas.width = canvas.width;

  drawProcess();

  requestAnimationFrame(loop);
}


let throttleTimer;

function render(data) {
  if (data) {
    let xy = [];
    if (Object.prototype.toString.call(data) === '[object String]') {
      xy = data.split(',');
    } else if (Object.prototype.toString.call(data) === '[object Array]') {
      xy = [0].concat(data);
    } else if (Object.prototype.toString.call(data) === '[object Object]') {
      xy[0] = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const k in data) {
        if (Object.prototype.hasOwnProperty.call(data, k)) {
          xy.push(data[k]);
        }
      }
    }

    if (!!xy[1] && !!xy[2] && xy[1] !== 0 && xy[2] !== 0) {
      const x = xy[1];
      const y = xy[2];
      const p = d3map.projection([x, y]);

      const d = new Dot(p);
      d.latlng = [x, y];
      if (new Date().getTime() % 4 === 0) {
        d.choosen = true;
      }

      particles.push(d);

      clearTimeout(throttleTimer);
      throttleTimer = setTimeout(() => {
        // dataPool = [];
      }, 16);
    }
  }
}


loop();
bgFade();

export default {
  dotSize: 2,
  rotate: false,
  bgFade: true,
  wtDot: 4,
  gsdotSize,
  gswtDot,
  transformMap,
  toggleBgFade,
  render,
};

// --endof clayer--
