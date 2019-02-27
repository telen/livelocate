/**
 * Created by telen on 16/5/20.
 */
import * as d3 from 'd3';
import d3map from './src/d3map';
import clayer from './src/clayer';

import requestAnimationPolyfill from './src/requestAnimation';

import './style.css';

requestAnimationPolyfill();

/*
 * Date format func
 * yyyy MM dd hh:mm:ss
 *
 */
// eslint-disable-next-line no-extend-native
Date.prototype.format = function format(y) {
  const x = this;
  const z = {
    M: x.getMonth() + 1,
    d: x.getDate(),
    h: x.getHours(),
    m: x.getMinutes(),
    s: x.getSeconds(),
  };
  // eslint-disable-next-line no-param-reassign
  y = y.replace(/(M+|d+|h+|m+|s+)/g, v => (`0${z[v.slice(-1)]}`).slice(-2));
  return y.replace(/(y+)/g, () => x.getFullYear().toString());
};

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight;
  d3map.svg.attr('width', width)
    .attr('height', height);
  d3map.g.select('rect').attr('width', width)
    .attr('height', height);
},
false);


setTimeout(() => {
  d3.csv('mock/data.txt', (error, data) => {
    let index = 0;
    setInterval(() => {
      let size = index + 100;
      if (size > data.length) {
        size = 100;
        index = 0;
        console.log('repeat');
      }

      for (; index < size; index++) {
        clayer.render(data[index]);
      }
    }, 1000);
  });
}, 2000);
