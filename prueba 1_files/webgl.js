var WebGLPlanet = (function () {

	var spriteWidth = 500;
	var spriteHeight = 500;
	var spriteX = 390;
	var spriteY = 100;

	var stage = new PIXI.Stage(0x000000);

	var renderer = PIXI.autoDetectRenderer(1280, 1280, null, true, true);

	var gameContainer = new PIXI.DisplayObjectContainer();

	stage.addChild(gameContainer);

	document.body.appendChild(renderer.view);

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
		console.log("mouseup");
	}, {capture: true});

	window.addEventListener('touchend', (event) => {
		computeMove = false;
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
		var cb = new MultipleCallbacks(9, makePlanet);

		loadImage("textura2.png", cb);
		loadImage("textura3.png", cb);
		loadImage("earth/earthlights.jpg", cb);
		loadImage("textura3ligths.png", cb);
		loadImage("cloud.png", cb);
		loadImage("moon512.jpg", cb);
		loadImage("earth/earthmap.jpg", cb);
		loadImage("earth/earthspec.jpg", cb);
		loadImage("earth/earthnormal.png", cb);

	}

	function makePlanet (argument) {
		var planet = PIXI.Texture.fromImage("textura3_.png");
		var dif = PIXI.Texture.fromImage("textura3difmap.png");
		var ligth = PIXI.Texture.fromImage("earth/earthlights.jpg");
		var cloud = PIXI.Texture.fromImage("cloud.png");
		var lava = PIXI.Texture.fromImage("moon512.jpg");
		var earthColor = PIXI.Texture.fromImage("earth/earthmap.jpg");
		var earthSpec = PIXI.Texture.fromImage("earth/earthspec.jpg");
		var earthNormal = PIXI.Texture.fromImage("earth/earthnormal.png");

		earthNormal.baseTexture._powerOf2 = true;
		earthSpec.baseTexture._powerOf2 = true;
		earthColor.baseTexture._powerOf2 = true;
		lava.baseTexture._powerOf2 = true;
		cloud.baseTexture._powerOf2 = true;
		planet.baseTexture._powerOf2 = true;
		dif.baseTexture._powerOf2 = true;
		ligth.baseTexture._powerOf2 = true;

		stage.addChild(createPlanet(earthColor, cloud, earthSpec, earthNormal, ligth, 1000, 100, 20));
		
		stage.interactionManager.onTouchMove = function (event) {
			console.log("touch move!");
			if(computeMove) computeTouch(event);
		};

		stage.interactionManager.onMouseMove = function (event) {
			console.log("mouse move!");
			if(computeMove) computeMouse(event);
		};

		requestAnimFrame(animate);
	}

	function createPlanet(planet, cloud, dif, normal, ligth, size, x, y) {
		var nm = new PIXI.NormalMapFilter(planet, cloud, dif, normal, ligth);
		filter.push(nm);

		sp = new PIXI.Sprite(ligth);
		sprite.push(sp);
		sp.shader = nm;

		sp.height = sp.width = size;
		nm.uniforms.width.value = sp.width;

		sp.position.x = x;
		sp.position.y = y;

		return sp
	}

	var time = 0;

	function animate() {
		var new_time = window.performance.now();
		overlay_fps.innerHTML = "FPS: " + Math.round(1000 / (new_time - time));
		time = new_time;

		for (var i = filter.length - 1; i >= 0; i--) {
			desplazamiento = 0.000005 * (time - startTime);
			filter[i].uniforms.desplazamiento.value = desplazamiento;
		}
		renderer.render(stage);
		requestAnimFrame(animate);
	}

	var lastEvent = null;

	function computeMouse (event) {
		if(lastEvent && event !== lastEvent){
			let movement = {x: event.pageX - lastEvent.pageX, y: event.pageY - lastEvent.pageY};

			for (var i = sprite.length - 1; i >= 0; i--) {

				//var coord = relativeCoords({x: event.pageX, y: event.pageY}, sprite[i]);

				filter[i].uniforms.lightPositionX.value += movement.x / 2;
				filter[i].uniforms.lightPositionY.value += movement.y / 2;
			}

		}
		
		lastEvent = event;
	}

	function computeTouch (event) {
		if(event !== lastEvent){
			lastEvent = event;
			var touchobj = event.changedTouches[0];

			for (var i = sprite.length - 1; i >= 0; i--) {

				var coord = relativeCoords({x: touchobj.pageX, y: touchobj.pageY});

				filter.uniforms.lightPositionX.value = coord.x;
				filter.uniforms.lightPositionY.value = coord.y;
			}
		}
	}

	function relativeCoords (position, sprite) {
		var newPos = {x: 0, y: 0};

		var spriteNewPos = {
			x: sprite.position.x + sprite.width / 2,
			y: sprite.position.y + sprite.height / 2
		};

		newPos.x = (position.x - spriteNewPos.x) / 30;
		newPos.y = (position.y - spriteNewPos.y) / 30;

		return newPos;
	}

	let last_known_scroll_position = 0;
	let previous_scroll = 0;
	let ticking = false;

	function scrollHandler(scroll_pos) {
		var dif = (last_known_scroll_position - previous_scroll) * 100;

		sprite.forEach((sprite, i) => {
			sprite.height += dif;
			sprite.width += dif;
			sprite.position.x -= dif/2;
			sprite.position.y -= dif/2;
			filter[i].uniforms.width.value += dif;
		});

		previous_scroll = last_known_scroll_position;
	}

	window.addEventListener('wheel', function(e) {
	  e.stopPropagation();
	  e.preventDefault();
	  last_known_scroll_position += e.deltaY * -0.1;

	  console.log("HOLA scrool", e);

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
