function draw() {
    let {
        width,
        height
    } = canvas;

    let {
        useTransparency,
        fillBackground,
    } = globalSettings;

    let maskingSettings = {
        redMask: true,
        greenMask: true,
        blueMask: true,
        alphaMask: true,
        depthMask: true,
    }

    let aspect = width / height;
    let sourceResolution = new Vector3(sourceWidth, sourceWidth / aspect, 1);
    let targetResolution = new Vector3(width, height, 1);
    let screenScale = targetResolution.quotient(sourceResolution);

    let lightsources = objects.filter((obj) => obj.lightsourceData.emits).map((obj) => obj.getLightsource(camera.position, camera.rotations));

    let colorBuffer = new Uint8ClampedArray(width * height * 4);
    let depthBuffer = new Float32Array(width * height);

    rasterize(objects, lightsources, colorBuffer, depthBuffer, maskingSettings);

    let bgColor = new RGBA(60, 60, 60, 255);
    let {r: bgR, g: bgG, b: bgB, a: bgA} = bgColor;
    
    let colorBufferLength = colorBuffer.length;

    if (fillBackground) {
        for (let i = 0; i < colorBufferLength - 3; i += 4) {
            if (useTransparency) {
                let a1 = colorBuffer[i + 3] / 255;
                let a2 = (colorBuffer[i + 3] * (255 - bgA)) / 255;

                colorBuffer[i] = colorBuffer[i] * a1 + bgR * a2;
                colorBuffer[i + 1] = colorBuffer[i + 1] * a1 + bgG * a2;
                colorBuffer[i + 2] = colorBuffer[i + 2] * a1 + bgB * a2;
                colorBuffer[i + 3] = (a1 + a2) * 255;
            } else if (colorBuffer[i + 3] == 0) {
                colorBuffer[i] = bgR;
                colorBuffer[i + 1] = bgG;
                colorBuffer[i + 2] = bgB;
                colorBuffer[i + 3] = bgA;
            }
        }
    }

    ctx.putImageData(new ImageData(colorBuffer, width), 0, 0);

    objectiveBenchmarker.add();
    iterationBenchmarker.add();

    let benchmarkerPrecision = 2;

    Terminal.print(objectiveBenchmarker.toString(benchmarkerPrecision));
    Terminal.print(iterationBenchmarker.toString(benchmarkerPrecision));
    Terminal.newLine();
    Terminal.print("FPS (current): " + Math.round(1000 / objectiveBenchmarker.averageRelativeTime()));
    Terminal.print("FPS (possible): " + Math.round(1000 / iterationBenchmarker.averageRelativeTime()));

    if (tick >= resetTicks) {
        tick = 0;
        
        objectiveBenchmarker.reset();
        iterationBenchmarker.reset();
    }
}

function rasterize(objects, lightsources, colorBuffer, depthBuffer, maskingSettings) {
    let {
        position: cameraPosition,
        rotations: cameraRotations,
        zNear,
    } = camera;

    let {
        frustomCulling,
        screenspaceCulling,
        backfaceCulling,
        depthTest,
        useTransparency,
    } = globalSettings;

    let {
        redMask,
        greenMask,
        blueMask,
        alphaMask,
        depthMask,
    } = maskingSettings;

    let {
        width,
        height
    } = canvas;

    let halfWidth = Math.floor(width / 2);
    let width4 = width * 4;
    let halfHeight = Math.floor(height / 2);
    let aspect = width / height;

    let sourceResolution = new Vector3(sourceWidth, sourceWidth / aspect, 1);
    let targetResolution = new Vector3(width, height, 1);
    let screenScale = targetResolution.quotient(sourceResolution);

    let lightsourcesLength = lightsources.length;

    for (let i = 0; i < objects.length; i++) {
        let object = objects[i];

        let {
            position: objectPosition,
            dimensions: objectDimensions,
            rotations: objectRotations,
        } = object.transformations;

        let shapeMinX = +Infinity, shapeMaxX = -Infinity;
        let shapeMinY = +Infinity, shapeMaxY = -Infinity;
        let shapeMinZ = +Infinity, shapeMaxZ = -Infinity;

        let boundingBoxVertices = getBounds(objectPosition, objectDimensions);

        for (let j = 0; j < boundingBoxVertices.length; j++) {
            let vertex = boundingBoxVertices[j];

            let transformed = vertex.difference(cameraPosition).rotateRad(cameraRotations);
            let projected = transformed.scaleZ(zNear);
            let resolutionScaled = projected.product(screenScale);
            let {x, y, z} =  resolutionScaled.rounded();

            shapeMinX = x < shapeMinX ? x : shapeMinX;
            shapeMaxX = x > shapeMaxX ? x : shapeMaxX;
            shapeMinY = y < shapeMinY ? y : shapeMinY; 
            shapeMaxY = y > shapeMaxY ? y : shapeMaxY;
            shapeMinZ = z < shapeMinZ ? z : shapeMinZ; 
            shapeMaxZ = z > shapeMaxZ ? z : shapeMaxZ;
        }


        // PER SHAPE CULLING


        let shapeBoundingWidth = shapeMaxX - shapeMinX;
        let shapeBoundingHeight = shapeMaxY - shapeMinY;
        const widthPercent = Math.abs(shapeBoundingWidth / width * 100);
        const heightPercent = Math.abs(shapeBoundingHeight / height * 100);

        let frustomFlag = false;
        let screenspaceFlag = false;

        switch (frustomCulling) {
            default: {
                frustomFlag = true;
                break;
            }
            case 1: {
                frustomFlag = !(shapeMaxZ < 0 || shapeMinX >= halfWidth || shapeMaxX < -halfWidth || shapeMinY >= halfHeight || shapeMaxY < -halfHeight);
                break;
            }
        }

        if (!frustomFlag) {
            continue;
        }

        switch (screenspaceCulling) {
            default: {
                screenspaceFlag = true;
                break;
            }
            case 1: {
                screenspaceFlag = widthPercent >= 10 && heightPercent >= 10;
                break;
            }
            case 2: {
                screenspaceFlag = widthPercent >= 1 && heightPercent >= 1;
                break;
            }
            case 3: {
                screenspaceFlag = widthPercent >= 0.1 && heightPercent >= 0.1;
                break;
            }
            case 4: {
                screenspaceFlag = widthPercent >= 0.01 && heightPercent >= 0.01;
                break;
            }
            case 5: {
                screenspaceFlag = widthPercent >= 0.001 && heightPercent >= 0.001;
                break;
            }
            case 6: {
                screenspaceFlag = widthPercent >= 0.0001 && heightPercent >= 0.0001;
                break;
            }
        }

        if (!screenspaceFlag) {
            continue;
        }
        
        let {
            structure,
            vertexData,

            renderSettings: {
                textureIndex, 
                vertexType, 
                attributeInterpolationMode,
                normalInterpolationMode,
                colorMode, 
                useLighting,
            }
        } = object;

        let numVertices = structure.length;
        let newVertices = [];
        let texture = textures[textureIndex];
        
        let step;
        
        if (vertexType == 0) {
            step = 3;
        } else if (vertexType == 1) {
            step = 1;
        }


        // VERTEX SHADER


        for (let j = 0; j < numVertices; j++) {
            let vertex = structure[j].product(objectDimensions).rotateRad(objectRotations).sum(objectPosition);

            let transformed = vertex.difference(cameraPosition).rotateRad(cameraRotations);
            let projected = transformed.scaleZ(zNear);
            let resolutionScaled = projected.product(screenScale);
            let rounded = resolutionScaled;

            newVertices[j] = rounded;
        }


        // TRIANGLE TRAVERSAL


        for (let j = 0; j < numVertices - 2; j += step) {
            let vert1Index = j;
            let vert2Index;
            let vert3Index;

            switch (vertexType) {
                default: {
                    vert2Index = j + 1;
                    vert3Index = j + 2;

                    break;
                }
                case 1: {
                    if (j & 1) {
                        vert2Index = j + 1;
                        vert3Index = j + 2;
                    } else {
                        vert2Index = j + 2;
                        vert3Index = j + 1;
                    }

                    break;
                }
            }

            let vert1 = newVertices[vert1Index];
            let vert2 = newVertices[vert2Index];
            let vert3 = newVertices[vert3Index];

            let {x: x1, y: y1, z: z1} = vert1;
            let {x: x2, y: y2, z: z2} = vert2;
            let {x: x3, y: y3, z: z3} = vert3;

            let minZ = Math.min(z1, z2, z3);
            let minX = Math.min(x1, x2, x3), maxX = Math.max(x1, x2, x3);
            let minY = Math.min(y1, y2, y3), maxY = Math.max(y1, y2, y3);


            // PER TRIANGLE CULLING
            // ~~~ and finding the area of the triangle

            if (minZ <= 0 || minX >= halfWidth || maxX < -halfWidth || minY >= halfHeight || maxY < -halfHeight) {
                continue
            }

            const triangleArea = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
            const triangleAreaSign = Math.sign(triangleArea);
            const triangleAreaAbs = Math.abs(triangleArea);

            let backfaceFlag = false;

            switch (backfaceCulling) {
                default: {
                    backfaceFlag = triangleArea != 0;
                    break;
                }
                case 1: {
                    backfaceFlag = triangleArea < 0;
                    break; 
                }
                case 2: {
                    backfaceFlag = triangleArea > 0;
                    break;
                }
            }

            if (!backfaceFlag) {
                continue;
            }


            // VERTEX DATA COLLECTION


            let {
                color: {r: r1, g: g1, b: b1, a: a1},
                normal: normal1,
                textureCoordinate: {x: u1, y: v1},
            } = vertexData[vert1Index];
            let {
                color: {r: r2, g: g2, b: b2, a: a2},
                normal: normal2,
                textureCoordinate: {x: u2, y: v2},
            } = vertexData[vert2Index];
            let {
                color: {r: r3, g: g3, b: b3, a: a3},
                normal: normal3,
                textureCoordinate: {x: u3, y: v3},
            } = vertexData[vert3Index];

            let {x: nx1, y: ny1, z: nz1} = normal1.rotateRad(objectRotations).rotateRad(cameraRotations).normalised();
            let {x: nx2, y: ny2, z: nz2} = normal2.rotateRad(objectRotations).rotateRad(cameraRotations).normalised();
            let {x: nx3, y: ny3, z: nz3} = normal3.rotateRad(objectRotations).rotateRad(cameraRotations).normalised();

            let z1Inverse = 1 / (z1 * triangleAreaAbs);
            let z2Inverse = 1 / (z2 * triangleAreaAbs);
            let z3Inverse = 1 / (z3 * triangleAreaAbs);

            minX = Math.floor(Math.max(minX, -halfWidth));
            maxX = Math.ceil(Math.min(maxX, halfWidth));
            minY = Math.floor(Math.max(minY, -halfHeight));
            maxY = Math.ceil(Math.min(maxY, halfHeight));

            const triangleBoundingWidth = maxX - minX;
            const triangleBoundingHeight = maxY - minY;

            const y2y3 = (y2 - y3) * triangleAreaSign;
            const x3x2 = (x3 - x2) * triangleAreaSign;
            const y3y1 = (y3 - y1) * triangleAreaSign;
            const x1x3 = (x1 - x3) * triangleAreaSign;
            const w3StepX = y2y3 + y3y1;
            const w3StepY = x3x2 + x1x3;

            let index1 = ((minX + halfWidth) + (minY + halfHeight) * width) * 4;
            let w1_1 = y2y3 * (minX - x3) + x3x2 * (minY - y3);
            let w2_1 = y3y1 * (minX - x3) + x1x3 * (minY - y3);
            let w3_1 = triangleAreaAbs - w1_1 - w2_1;

            // fix JavaScript precision errors by adding tolerance, I hate this language

            w1_1 += w1Tolerance;
            w2_1 += w2Tolerance;
            w3_1 += w3Tolerance;


            // ACTUAL RASTERIZATION


            for (let ix = 0; ix < triangleBoundingWidth; ix++, index1 += 4, w1_1 += y2y3, w2_1 += y3y1, w3_1 -= w3StepX) {
                let index2 = index1;
                let w1_2 = w1_1;
                let w2_2 = w2_1;
                let w3_2 = w3_1;

                for (let iy = 0; iy < triangleBoundingHeight; iy++, index2 += width4, w1_2 += x3x2, w2_2 += x1x3, w3_2 -= w3StepY) {
                    if (w1_2 < 0 || w2_2 < 0 || w3_2 < 0) {
                        continue;
                    }

                    let depthFlag = true;

                    let existingDepth = depthBuffer[index2 / 4];
                    let existingTransparency = colorBuffer[index2 + 3];

                    let w1 = w1_2 * z1Inverse;
                    let w2 = w2_2 * z2Inverse;
                    let w3 = w3_2 * z3Inverse;

                    let z = 1 / (w1 + w2 + w3);

                    // FRAGMENT SHADER STAGE

                    let pw1, pw2, pw3;
                    let r, g, b, a;
                    let cR, cG, cB;
                    let coeff1, coeff2;

                    switch (attributeInterpolationMode) {
                        default: {
                            pw1 = w1 * z;
                            pw2 = w2 * z;
                            pw3 = w3 * z;

                            break;
                        }
                        case 1: {
                            pw1 = 1;
                            pw2 = 0;
                            pw3 = 0;

                            break;
                        }
                        case 2: { 
                            if (w1 > w2 && w1 > w3) {
                                pw1 = 1;
                                pw2 = 0;
                                pw3 = 0;
                            } else if (w2 > w3) {
                                pw1 = 0;
                                pw2 = 1;
                                pw3 = 0;
                            } else {
                                pw1 = 0;
                                pw2 = 0;
                                pw3 = 1;
                            }

                            break;
                        }
                    }

                    switch (colorMode) {
                        default: {
                            r = r1 * pw1 + r2 * pw2 + r3 * pw3;
                            g = g1 * pw1 + g2 * pw2 + g3 * pw3;
                            b = b1 * pw1 + b2 * pw2 + b3 * pw3;
                            a = a1 * pw1 + a2 * pw2 + a3 * pw3;

                            break;
                        }
                        case 1: {
                            let u = u1 * pw1 + u2 * pw2 + u3 * pw3;
                            let v = v1 * pw1 + v2 * pw2 + v3 * pw3;

                            ({r, g, b, a} = texture.uvComponents(u, v));
                            break;
                        }
                    }

                    if (existingDepth != 0) {
                        switch (depthTest) {
                            default: {
                                depthTest = true;
                                break;
                            }
                            case 1: {
                                depthTest = existingDepth > z;
                                break;
                            }
                            case 2: {
                                depthTest = existingDepth >= z;
                                break;
                            }
                            case 3: {
                                depthTest = existingDepth < z;
                                break;
                            }
                            case 4: {
                                depthTest = existingDepth <= z;
                                break;
                            }
                            case 5: {
                                depthTest = existingDepth == z;
                                break;
                            }
                            case 6: {
                                depthTest = existingDepth != z;
                                break;
                            }
                        }   
                    }

                    if (depthFlag) {
                        if (useTransparency) {
                            coeff1 = a / 255;
                            coeff2 = (existingTransparency * (255 - a)) / 255;
                        } else {
                            coeff1 = 1;
                            coeff2 = 0;
                        }
                    } else {
                        if (useTransparency) {
                            coeff1 = (a * (255 - existingTransparency)) / 255;
                            coeff2 = existingTransparency / 255;
                        } else {
                            if (existingTransparency != 0) {
                                continue;
                            }

                            coeff1 = 1;
                            coeff2 = 0;
                        }
                    }

                    let fragPosition = new Vector3(minX + ix, minY + iy, z).quotient(screenScale).unscaleZ(zNear);
                    let fragmentNormal;

                    switch (normalInterpolationMode) {
                        default: {
                            fragmentNormal = new Vector3(
                                nx1 * pw1 + nx2 * pw2 + nx3 * pw3, 
                                ny1 * pw1 + ny2 * pw2 + ny3 * pw3, 
                                nz1 * pw1 + nz2 * pw2 + nz3 * pw3,
                            ).normalised();

                            break;
                        }
                        case 1: {
                            fragmentNormal = new Vector3(
                                nx1 * w1 + nx2 * w2 + nx3 * w3, 
                                ny1 * w1 + ny2 * w2 + ny3 * w3, 
                                nz1 * w1 + nz2 * w2 + nz3 * w3,
                            ).scaled(z).normalised();

                            break;
                        }
                    }

                    if (useLighting) {
                        let toOrigin = fragPosition.scaled(-1).normalised();

                        cR = r * ambientIntensity;
                        cG = g * ambientIntensity;
                        cB = b * ambientIntensity;

                        for (let lsIndex = 0; lsIndex < lightsourcesLength; lsIndex++) {
                            let {position: lsPosition, color: lsColor, diffuseIntensity, diffuseExponent, specularIntensity, specularExponent} = lightsources[lsIndex];

                            let toLightsource = lsPosition.difference(fragPosition).normalised();
                            let normalLightsourceDot = fragmentNormal.dotProd(toLightsource);
                            let reflection = fragmentNormal.scaled(normalLightsourceDot * 2).difference(toLightsource);

                            let diffuseDot = Math.max(normalLightsourceDot, 0);
                            let diffuseVal = Math.pow(diffuseDot, diffuseExponent) * diffuseIntensity;

                            let specularDot = Math.max(reflection.dotProd(toOrigin), 0);
                            let specularVal = Math.pow(specularDot, specularExponent) * specularIntensity;
                            
                            let finalDiffuseCoefficient = diffuseVal * (1 - specularVal);
                            let finalSpecularCoefficient = specularVal;

                            cR += r * finalDiffuseCoefficient + lsColor.r * finalSpecularCoefficient;
                            cG += g * finalDiffuseCoefficient + lsColor.g * finalSpecularCoefficient;
                            cB += b * finalDiffuseCoefficient + lsColor.b * finalSpecularCoefficient;
                        } 
                    } else {
                        cR = r;
                        cG = g;
                        cB = b;
                    }

                    if (depthFlag) {
                        if (depthMask) {
                            depthBuffer[index2 / 4] = z;
                        }
                    }

                    if (useTransparency) {
                        cR = cR * coeff1 + colorBuffer[index2] * coeff2;
                        cG = cG * coeff1 + colorBuffer[index2 + 1] * coeff2;
                        cB = cB * coeff1 + colorBuffer[index2 + 2] * coeff2;
                        a = (coeff1 + coeff2) * 255;
                    }

                    if (redMask) {
                        colorBuffer[index2] = cR;
                    }
                    if (greenMask) {
                        colorBuffer[index2 + 1] = cG;
                    }
                    if (blueMask) {
                        colorBuffer[index2 + 2] = cB;
                    }
                    if (alphaMask) {
                        colorBuffer[index2 + 3] = a;
                    }
                }
            }
        }
    }
}

function getBounds(location, dimensions) {
    let {x: lX, y: lY, z: lZ} = location;
    let {x: dX, y: dY, z: dZ} = dimensions;

    let v1 = new Vector3(lX + dX, lY + dY, lZ + dZ);
    let v2 = new Vector3(lX - dX, lY + dY, lZ + dZ);
    let v3 = new Vector3(lX + dX, lY - dY, lZ + dZ);
    let v4 = new Vector3(lX - dX, lY - dY, lZ + dZ);
    let v5 = new Vector3(lX + dX, lY + dY, lZ - dZ);
    let v6 = new Vector3(lX - dX, lY + dY, lZ - dZ);
    let v7 = new Vector3(lX + dX, lY - dY, lZ - dZ);
    let v8 = new Vector3(lX - dX, lY - dY, lZ - dZ);

    return [v1, v2, v3, v4, v5, v6, v7, v8];
}

function comparisonTest(value1, value2, mode) {
    switch (mode) {
        default: {
            return true;
        }
        case 1: {
            return value2 > value1;
        }
        case 2: {
            return value2 >= value1;
        }
        case 3: {
            return value2 < value1;
        }
        case 4: {
            return value2 <= value1;
        }
        case 5: {
            return value2 == value1;
        }
        case 6: {
            return value2 != value1;
        }
    }
}