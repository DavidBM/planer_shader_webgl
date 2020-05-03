PIXI.NormalMapFilter = function(planetTexture, cloudTexture, difTexture, normalTexture, ligthTexture) {
    PIXI.AbstractFilter.call(this);

    var _this = this;
    var loadFunctions = {};

    this.passes = [this];

    this.uniforms = {
        planetTexture: {
            type: 'sampler2D',
            value: planetTexture
        },
        cloudTexture: {
            type: 'sampler2D',
            value: cloudTexture
        },
        difTexture: {
            type: 'sampler2D',
            value: difTexture
        },
        normalTexture: {
            type: 'sampler2D',
            value: normalTexture
        },
        ligthTexture: {
            type: 'sampler2D',
            value: ligthTexture
        },
        desplazamiento: {
            type: '1f',
            value: 0
        },
        width: {
            type: '1f',
            value: 0
        },
        lightPositionX: {
            type: '1f',
            value: 5
        },
        lightPositionY: {
            type: '1f',
            value: 5
        },
        lightPositionZ: {
            type: '1f',
            value: 10
        }
    };

    if (!ligthTexture.baseTexture.hasLoaded) {
        loadFunctions.ligthTexture = function () {
            _this.boundLoadedFunction('ligthTexture');
        };
        ligthTexture.baseTexture.on("loaded", loadFunctions.ligthTexture);
    }

    if (!difTexture.baseTexture.hasLoaded) {
        loadFunctions.difTexture = function () {
            _this.boundLoadedFunction('difTexture');
        };
        difTexture.baseTexture.on("loaded", loadFunctions.difTexture);
    }

    if (!planetTexture.baseTexture.hasLoaded) {
        loadFunctions.planetTexture = function () {
            _this.boundLoadedFunction('planetTexture');
        };
        planetTexture.baseTexture.on("loaded", loadFunctions.planetTexture);
    }

    if (!cloudTexture.baseTexture.hasLoaded) {
        loadFunctions.cloudTexture = function() {
            _this.boundLoadedFunction('cloudTexture');
        };
        cloudTexture.baseTexture.on("loaded", loadFunctions.cloudTexture);
    }

    this.fragmentSrc = [FRAGMENT_SHADER];
    this.vertexSrc   = [document.getElementById('shader-vs').innerHTML];

};

PIXI.NormalMapFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
PIXI.NormalMapFilter.prototype.constructor = PIXI.NormalMapFilter;

PIXI.NormalMapFilter.prototype.onTextureLoaded = function(texture) {

    this.uniforms[texture].value.baseTexture.off("loaded", loadFunctions[texture]);
};
