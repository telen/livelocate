/**
 * Created by telen on 16/5/20.
 */

/**
 * requestAnimation polyfill
 */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

/*
 * Date format func
 * yyyy MM dd hh:mm:ss
 *
 */
Date.prototype.format = function (y) {
    var x = this;
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
        return ('0'+ z[v.slice(-1)])
            .slice(-2);
    });
    return y.replace(/(y+)/g, function (v) {
        return x.getFullYear().toString();
    });
};



var d3map = (function() {

    var width = window.innerWidth,
        height = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight;

    var projection = d3.geo.mercator()
        .scale(800)
        .translate([(0.7 * width - 1686), (width == height ? 1119 : 960)]);

    var path = d3.geo.path()
        .projection(projection);

    var zoom = d3.behavior.zoom()
        .translate(projection.translate())
        .scale(projection.scale())
        .scaleExtent([800, 11 * height])
        .on("zoom", zoomed);

    var svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height);

    var g = svg.append("g")
        .call(zoom);

    g.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);



    d3.json('china.json', function(error, china) {
        if (error) throw error;

        g.append("g")
            .attr("id", "states")
            .selectAll("path")
            .data(china.features)
            .enter().append("path")
            .attr("d", path);
    });



    // function clicked(d) {
    //     var centroid = path.centroid(d),
    //         translate = projection.translate();

    //     projection.translate([
    //         translate[0] - centroid[0] + width / 2,
    //         translate[1] - centroid[1] + height / 2
    //     ]);

    //     zoom.translate(projection.translate());

    //     g.selectAll("path").transition()
    //         .duration(700)
    //         .attr("d", path);
    // }

    var cnt = 0;
    function zoomed() {
        projection.translate(d3.event.translate).scale(d3.event.scale);
        g.selectAll("path").attr("d", path);
        $(g).trigger('zoom');
        // console.log(cnt++, d3.event.translate, d3.event.scale, window.innerWidth);
    }

   // g.on('mousemove', function() {
   //     console.log(d3.mouse(this), projection.invert(d3.mouse(this)));
   // });

    return {
        projection: projection,
        svg: svg,
        g: g
    }
})(); //--endof d3map--

window.addEventListener('resize', function() {

        var width = window.innerWidth,
            height = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight;
        d3map.svg.attr("width", width)
            .attr("height", height);
        d3map.g.select("rect").attr("width", width)
            .attr("height", height);
    },
    false
);


var clayer = (function() {

    var self = this;
    var PI2 = 2 * Math.PI;

    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight;

    var particles = [];

    var bgcanvas = document.createElement('canvas');
    var canvas = document.createElement('canvas');
    var offCanvas = document.createElement('canvas');
    var offCtx = offCanvas.getContext('2d');

    var bgctx;
    var context;

    bgcanvas.id = "bgcanvas";
    canvas.id = "canvas";
    document.getElementById('graph').appendChild(bgcanvas);
    document.getElementById('graph').appendChild(canvas);

    if(canvas && canvas.getContext) {
        context = canvas.getContext('2d');
        bgctx = bgcanvas.getContext('2d');
        context.globalCompositeOperation = 'destination-over';
        window.addEventListener('resize', windowResizeHandler, false);
        windowResizeHandler();
    }

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

    // ===== settings =====
    self.dotSize = 1.5;
    function gsdotSize(v) {
        if (!arguments.length) return self.dotSize;
        self.dotSize = v;
    }

    self.rotate = false;
    function transformMap(value) {
        if (value) {
            $("#graph").css("transform", "rotateX(45deg)")
        } else {
            $("#graph").css("transform", "rotateX(0deg)")
        }
    }

    self.wtDot = 4;
    function gswtDot(v) {
        if (!arguments.length) return self.wtDot;
        self.wtDot = v;
    }

    function toggleBgFade(value) {
        if (!arguments.length) return self.bgFadeTimer;
        self.bgFadeTimer = value;
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
        this.alphaFade = .05;
        this.driection = 1;

        this.gradientLength = 2;
        this.gradientLengthSpeed = .05;
        this.gradientDirection = -1;

        this.color = function() {
            return "rgba(0, 229, 229, " + this.alpha + ")";
        }
    }


    $(d3map.g).on('zoom', function() {
        bgcanvas.width = bgcanvas.width;
        offCanvas.width = offCanvas.width;

        for (var i = 0; i < particles.length; i++) {
            particles[i].xy = d3map.projection(particles[i].latlng);
        }
    });

    function drawProcess() {
        var c = 0;
        for (var i = particles.length - 1; i >= 0; i--) {

            if ((new Date().getTime() - particles[i].birth) > particles[i].life) { // dots life expire, moving to background canvas.
                particles[i].alpha = .9;
                bgctx.fillStyle = particles[i].color();
                bgctx.fillRect(particles[i].xy[0], particles[i].xy[1], gsdotSize(), gsdotSize());

                particles.splice(i, 1);

            } else {

                if (particles[i].choosen) {

                    context.fillStyle = "rgba(245,255,255, "+ 1 +")";
                    context.fillRect(particles[i].xy[0], particles[i].xy[1], particles[i].gradientLength, particles[i].gradientLength);

                    c++;

                    if (particles[i].gradientLength <= 1) {
                        particles[i].gradientDirection = 1;
                    } else if (particles[i].gradientLength >= gswtDot()) {
                        particles[i].gradientDirection = -1;
                    }

                    particles[i].gradientLength = particles[i].gradientLength + particles[i].gradientDirection * particles[i].gradientLengthSpeed;

                } else {
                    context.fillStyle = particles[i].color();
                    context.fillRect(particles[i].xy[0], particles[i].xy[1], gsdotSize(), gsdotSize());

                    if (particles[i].alpha >= 2) {
                        particles[i].direction = -1;
                    } else if (particles[i].alpha <= .4) {
                        particles[i].direction = 1;
                    }

                    particles[i].alpha = particles[i].alpha + particles[i].direction * particles[i].alphaFade;
                }

            }
        }

    }

    /**
     * Add a alpha to background canvas every xx seconds, fading the background dots.
     */
    self.bgFadeTimer = true;
    function bgFade() {

        var bgImgData = bgctx.getImageData(0, 0, bgcanvas.width, bgcanvas.height);
        offCtx.putImageData(bgImgData, 0, 0);

        bgcanvas.width = bgcanvas.width;
        bgcanvas.globalCompositeOperation = "source-out";
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

    if ( typeof Stats === 'function' ) {
        document.body.appendChild( ( stats = new Stats() ).domElement );
    }


    var throttleTimer;
    var dataPool = [];
    function render(data) {
        if (data) {
            var xy = [];
            if (Object.prototype.toString.call(data) == '[object String]') {
                xy = data.split(',');
            } else if (Object.prototype.toString.call(data) == '[object Array]') {
                xy = [0].concat(data);
            } else if (Object.prototype.toString.call(data) == '[object Object]') {
                xy[0] = 0;
                for (var k in data) {
                    xy.push(data[k]);
                }
            }

            if(!!xy[1] && !!xy[2] && xy[1] != 0 && xy[2] != 0) {
                var x = xy[1];
                var y = xy[2];
                var p = d3map.projection([x, y]);

                var d = new Dot(p);
                d.latlng = [x, y];
                if (new Date().getTime() % 4 == 0) {
                    d.choosen = true;
                }

                particles.push(d);

                clearTimeout(throttleTimer);
                throttleTimer = setTimeout(function() {
                    dataPool = [];
                }, 16);
            }
        }
    }


    loop();
    bgFade();

    return {
        dotSize: 2,
        rotate: false,
        bgFade: true,
        wtDot: 4,
        gsdotSize: gsdotSize,
        gswtDot: gswtDot,
        transformMap: transformMap,
        toggleBgFade: toggleBgFade,
        render: render
    };

})(); //--endof clayer--

setTimeout(function() {

d3.csv('makedata/data.txt',function(error, data) {

    var index = 0;
    setInterval(function() {
        var size = index + 100;
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

