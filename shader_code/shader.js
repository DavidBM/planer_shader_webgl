function getMyShader(planetTexture, cloudTexture, difTexture, normalTexture, ligthTexture) {
    let filter =  new PIXI.Filter(
        document.getElementById('shader-vs').innerHTML, 
        FRAGMENT_SHADER, {
            planetTexture: planetTexture,
            cloudTexture: cloudTexture,
            difTexture: difTexture,
            normalTexture: normalTexture,
            ligthTexture: ligthTexture,
            desplazamiento: 0,
            width: 0,
            lightPositionX: 5,
            lightPositionY: 5,
            lightPositionZ: 10
        }
    );

    filter.autoFit = false;

    return filter;
};
