var WebGLPlanet = (function () {

	/*var renderer = PIXI.autoDetectRenderer({
		width: 1280,
		height: 1280
	});*/

	var app = new PIXI.Application({
	    width: 1280, height: 1280, backgroundColor: 0x000000, resolution: window.devicePixelRatio || 1,
	});

	var stage = new PIXI.Container();
	stage.interactive = true;

	app.stage.addChild(stage);

	document.body.appendChild(app.view);

	var desplazamiento = 0;
	var container;
	var filter = [];
	var sprite = [];
	var startTime = window.performance.now();

	var computeMove = false;

	window.addEventListener('mousedown', (event) => {
		computeMove = true;
		console.log("mousedown");
	}, {capture: true});

	window.addEventListener('mouseup', (event) => {
		computeMove = false;
		lastEvent = null;
		lastTouchEvent = null;
		console.log("mouseup");
	}, {capture: true});

	window.addEventListener('touchend', (event) => {
		computeMove = false;
		lastTouchEvent = null;
		lastEvent = null;
	}, {capture: true});

	window.addEventListener('touchstart', (event) => {
		computeMove = true;
	}, {capture: true});

	function loadImage (url, callback) {
		var imageLoader = new PIXI.ImageLoader(url, true);
		imageLoader.addEventListener("loaded", callback);
		imageLoader.load();
	}

	function webGLStart() {
		makePlanet();
	}

	function makePlanet (argument) {
		var cloud = PIXI.Texture.from("cloud.png");

		var ligth = PIXI.Texture.from("earth/earthlights.jpg");
		var earthColor = PIXI.Texture.from("earth/earthmap.jpg");
		var earthSpec = PIXI.Texture.from("earth/earthspec.jpg");
		var earthNormal = PIXI.Texture.from("earth/earthnormal.png");

		earthNormal.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
		earthSpec.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
		earthColor.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
		cloud.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
		ligth.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

		stage.addChild(createPlanet(earthColor, cloud, earthSpec, earthNormal, ligth, 1000, 600, 520));
		
		stage.on("touchmove", function (event) {
			console.log("touch move!");
			if(computeMove) computeTouch(event);
		});

		stage.on("mousemove", function (event) {
			console.log("mouse move!");
			if(computeMove) computeMouse(event);
		});

		//requestAnimationFrame(animate);
	}

	function createPlanet(planet, cloud, dif, normal, ligth, size, x, y) {
		var nm = getMyShader(planet, cloud, dif, normal, ligth);
		filter.push(nm);

		sp = new PIXI.Sprite(planet);
		sp.anchor.set(0.5);

		sp.height = sp.width = size;
		nm.uniforms.width = sp.width;

		sp.filters = [nm];

		sp.position.x = x;
		sp.position.y = y;

		sprite.push(sp);
		return sp
	}

	var time = 0;

	/*function animate() {
		var new_time = window.performance.now();
		overlay_fps.innerHTML = "FPS: " + Math.round(1000 / (new_time - time));
		time = new_time;

		for (var i = filter.length - 1; i >= 0; i--) {
			filter[i].uniforms.desplazamiento = 0.000005 * (time - startTime);
		}
		renderer.render(stage);
		requestAnimationFrame(animate);
	}*/

	app.ticker.add((delta) => {
		var new_time = window.performance.now();
		overlay_fps.innerHTML = "FPS: " + Math.round(1000 / (new_time - time));
		time = new_time;

		for (var i = filter.length - 1; i >= 0; i--) {
			filter[i].uniforms.desplazamiento = 0.000005 * (time - startTime);
		}
	});

	var lastEvent = null;

	function computeMouse (event) {
		let originalEvent = event.data.originalEvent;
		if(lastEvent){
			let movement = {x: originalEvent.pageX - lastEvent.pageX, y: originalEvent.pageY - lastEvent.pageY};

			for (var i = sprite.length - 1; i >= 0; i--) {

				//var coord = relativeCoords({x: event.pageX, y: event.pageY}, sprite[i]);

				filter[i].uniforms.lightPositionX += movement.x / 2;
				filter[i].uniforms.lightPositionY += movement.y / 2;

				sprite[i].position.x += movement.x / 2;
				sprite[i].position.y += movement.y / 2;
			}

		}
		
		lastEvent = originalEvent;
	}

	var lastTouchEvent = null;

	function computeTouch (event) {
		let originalEvent = event.data.originalEvent;
		var touchobj = originalEvent.changedTouches[0];

		if (lastTouchEvent) {

			let movement = {x: touchobj.pageX - lastTouchEvent.pageX, y: touchobj.pageY - lastTouchEvent.pageY};

			for (var i = sprite.length - 1; i >= 0; i--) {

				//var coord = relativeCoords({x: touchobj.pageX, y: touchobj.pageY}, sprite[i]);

				filter[i].uniforms.lightPositionX += movement.x / 2;
				filter[i].uniforms.lightPositionY += movement.y / 2;

				sprite[i].position.x += movement.x / 2;
				sprite[i].position.y += movement.y / 2;
			}
		}

		lastTouchEvent = touchobj;
	}

	/*function relativeCoords (position, sprite) {
		var newPos = {x: 0, y: 0};

		var spriteNewPos = {
			x: sprite.position.x + sprite.width / 2,
			y: sprite.position.y + sprite.height / 2
		};

		newPos.x = (position.x - spriteNewPos.x) / 30;
		newPos.y = (position.y - spriteNewPos.y) / 30;

		return newPos;
	}*/

	let last_known_scroll_position = 0;
	let previous_scroll = 0;
	let ticking = false;

	function scrollHandler(scroll_pos) {
		var dif = (last_known_scroll_position - previous_scroll) * 100;

		sprite.forEach((sprite, i) => {
			sprite.height += dif;
			sprite.width = sprite.height;
			filter[i].uniforms.width = sprite.width;
		});

		previous_scroll = last_known_scroll_position;
	}

	window.addEventListener('wheel', function(e) {
	  e.stopPropagation();
	  e.preventDefault();
	  last_known_scroll_position += e.deltaY * -0.1;

	  //console.log("HOLA scrool", e);

	  if (!ticking) {
	    window.requestAnimationFrame(function() {
	      scrollHandler(last_known_scroll_position);
	      ticking = false;
	    });

	    ticking = true;
	  }
	}, {capture: true});

	return webGLStart;
})();

var overlay_fps;

(function () {
    var overlay, lastCount, lastTime, timeoutFun;

    overlay = document.createElement('div');
    overlay.style.background = 'rgba(0, 0, 0, .7)';
    overlay.style.bottom = '0';
    overlay.style.color = '#fff';
    overlay.style.display = 'inline-block';
    overlay.style.fontFamily = 'Arial';
    overlay.style.fontSize = '10px';
    overlay.style.lineHeight = '12px';
    overlay.style.padding = '5px 8px';
    overlay.style.position = 'fixed';
    overlay.style.right = '0';
    overlay.style.zIndex = '1000000';
    overlay.innerHTML = 'FPS: -';
    document.body.appendChild(overlay);

    overlay_fps = overlay;

    lastCount = window.mozPaintCount;
    lastTime = performance.now();

    timeoutFun = function () {
        var curCount, curTime;

        curCount = window.mozPaintCount;
        curTime = performance.now();
        overlay.innerHTML = 'FPS: ' + ((curCount - lastCount) / (curTime - lastTime) * 1000).toFixed(2);
        lastCount = curCount;
        lastTime = curTime;
        setTimeout(timeoutFun, 1000);
    };

    setTimeout(timeoutFun, 1000);
}())
