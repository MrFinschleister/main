let settings = {
    vertexType: {
        triangles: 0,
        strip: 1,
    },

    attributeInterpolation: {
        smooth: 0,
        first: 1,
        nearest: 2,
    },

    normalInterpolation: {
        default: 0,
        correct: 1,
    },

    color: {
        vertex: 0,
        texture: 1,
    },

    frustomCulling: {
        none: 0,
        screen: 1,
    },

    backfaceCulling: {
        none: 0,
        counterclockwise: 1,
        clockwise: 2,
    },

    screenspaceCulling: {
        none: 0,
        tenth: 1,
        hundredth: 2,
        thousandth: 3,
        tenthousandth: 4,
        hundredthousandth: 5,
        millionth: 6,
    },

    depthTest: {
        none: 0,
        less: 1,
        lequals: 2,
        greater: 3,
        gequals: 4,
        equals: 5,
        notequals: 6,
    },
};

let settingsPresets = {
    icosphere: new ObjectRenderSettings({
        vertexType: settings.vertexType.triangles,
        attributeInterpolationMode: settings.attributeInterpolation.smooth,
        colorMode: settings.color.vertex,
        useLighting: true,
    }),
    icosphereTextured1: new ObjectRenderSettings({
        vertexType: settings.vertexType.triangles,
        attributeInterpolationMode: settings.attributeInterpolation.smooth,
        colorMode: settings.color.texture,
        useLighting: true,
        textureIndex: 0,
    }),
    icosphereTextured2: new ObjectRenderSettings({
        vertexType: settings.vertexType.triangles,
        attributeInterpolationMode: settings.attributeInterpolation.smooth,
        colorMode: settings.color.texture,
        useLighting: true,
        textureIndex: 1,
    }),
    icosphereNolighting: new ObjectRenderSettings({
        vertexType: settings.vertexType.triangles,
        attributeInterpolationMode: settings.attributeInterpolation.smooth,
        colorMode: settings.color.vertex,
        useLighting: false,
    }),
    cube: new ObjectRenderSettings({
        vertexType: settings.vertexType.triangles,
        attributeInterpolationMode: settings.attributeInterpolation.smooth,
        colorMode: settings.color.vertex,
        useLighting: true,
    }),
    cubeNolighting: new ObjectRenderSettings({
        vertexType: settings.vertexType.triangles,
        attributeInterpolationMode: settings.attributeInterpolation.smooth,
        colorMode: settings.color.vertex,
        useLighting: false,
    }),
}

let mappingPresets = {
    icosphereWhite: new ObjectMappingSettings({
        vColorMap: 0,
        vTxCoordMap: 0,
        vNormalMap: 0,
        vColorValue: 255,
    }),
    icosphereGrey: new ObjectMappingSettings({
        vColorMap: 0,
        vTxCoordMap: 0,
        vNormalMap: 0,
        vColorValue: new RGBA(255, 255, 255, 150),

    }),
    icosphereRed: new ObjectMappingSettings({
        vColorMap: 0,
        vTxCoordMap: 0,
        vNormalMap: 0,
        vColorValue: new RGBA(255, 0, 0, 150),
    }),
    icosphereGreen: new ObjectMappingSettings({
        vColorMap: 0,
        vTxCoordMap: 0,
        vNormalMap: 0,
        vColorValue: new RGBA(0, 255, 0, 150),
    }),
    icosphereBlue: new ObjectMappingSettings({
        vColorMap: 0,
        vTxCoordMap: 0,
        vNormalMap: 0,
        vColorValue: new RGBA(0, 0, 255, 150),
    }),
    icosphere: new ObjectMappingSettings({
        vColorMap: 1,
        vTxCoordMap: 0,
        vNormalMap: 0,
    }),
    icosphereTransparent: new ObjectMappingSettings({
        vColorMap: 2,
        vTxCoordMap: 0,
        vNormalMap: 0,
    }),
    icosphereTextured: new ObjectMappingSettings({
        vColorMap: 1,
        vTxCoordMap: 1,
        vNormalMap: 0,
    }),
    cubeWhite: new ObjectMappingSettings({
        vColorMap: 0,
        vTxCoordMap: 0,
        vNormalMap: 1,
    }),
    cube: new ObjectMappingSettings({
        vColorMap: 1,
        vTxCoordMap: 0,
        vNormalMap: 1,
    }),
    cubeTransparent: new ObjectMappingSettings({
        vColorMap: 2,
        vTxCoordMap: 0,
        vNormalMap: 0,
    }),
    cubeTextured: new ObjectMappingSettings({
        vColorMap: 2,
        vTxCoordMap: 0,
        vNormalMap: 0,
    }),
}

let lightsourcePresets = {
    none: new ObjectLightsourceData({
        emits: false,
    }),
    basic: new ObjectLightsourceData({
        emits: true,
        color: RGBA.white(),
        diffuseIntensity: 1,
        diffuseExponent: 1,
        specularIntensity: 0.5,
        specularExponent: 8,
    }),
}

let globalSettings = {
    frustomCulling: settings.frustomCulling.screen,
    screenspaceCulling: settings.screenspaceCulling.none,
    backfaceCulling: settings.backfaceCulling.counterclockwise,
    depthTest: settings.depthTest.less,
    useTransparency: false,
    fillBackground: false,
}