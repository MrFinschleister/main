class ParsedObj {
    constructor(fileName, vertices, mtlFileName = "unused.mtl") {
        this.fileName = fileName;
        this.vertices = vertices;
        this.mtlFileName = mtlFileName;
    }

    toString() {
        return `.obj File: ${this.fileName}\n\n.mtl File Used: ${this.mtlFileName}\n\nVertices: ${this.vertices.join("\n\n")}`
    }
}

class Vertex {
    constructor({position, textureCoordinate, normal, materialName = "unused", color = RGBA.white()} = {}) {
        this.position = position;
        this.textureCoordinate = textureCoordinate;
        this.normal = normal;
        this.materialName = materialName;
        this.color = color;
    }

    toString() {
        return `Position: ${this.position}\nTexture Coordinate: ${this.textureCoordinate}\nNormal: ${this.normal}\nMaterial Name: ${this.materialName}\nColor: ${this.color}`
    }
}

class ParsedMtl {
    constructor(fileName, materials) {
        this.fileName = fileName;
        this.materials = materials;
    }

    toString() {
        return `.mtl File: ${this.fileName}\n\nMaterials:\n\n${Object.values(this.materials).join("\n\n")}`;
    }

    getMaterial(materialName) {
        return this.materials[materialName];
    }
}

class Material {
    constructor(name, {Ns = 0, Ka = RGBA.white(), Kd = RGBA.white(), Ks = RGBA.white(), Ke = Vector3.neutral(), Ni = 0, d = 0, illum = 0} = {}) {
        this.name = name;
        this.Ns = Ns;
        this.Ka = Ka;
        this.Kd = Kd;
        this.Ks = Ks;
        this.Ke = Ke;
        this.Ni = Ni;
        this.d = d;
        this.illum = illum;
    }

    toString() {
        return `Name: ${this.name}\nNs: ${this.Ns}\nKa: ${this.Kd}\nKs: ${this.Ks}\nNs: ${this.Ke}\nNi: ${this.Ni}\nd: ${this.d}\nillum: ${this.illum}`
    }
}

class FileParser {
    static parseSegmentsAsFloat(segments) {
        return segments.map((segment) => segment[0]);
    }

    static parseSegmentAsFloat(segment) {
        return segment[0];
    }

    static parseSegmentsAsVector2(segments) {
        return segments.map((segment) => new Vector2(...segment.slice(0, 2)));
    }

    static parseSegmentAsVector2(segment) {
        return new Vector2(...segment.slice(0, 2));
    }

    static parseSegmentsAsVector3(segments) {
        return segments.map((segment) => new Vector3(...segment.slice(0, 3)));
    }

    static parseSegmentAsVector3(segment) {
        return new Vector3(...segment.slice(0, 3));
    }

    static parseSegmentAsRGB(segments) {
        return segments.map((segment) => new RGBA(...segment.slice(0, 3), 1).scaled(255));
    }

    static parseSegmentAsRGB(segment) {
        return new RGBA(...segment.slice(0, 3), 1).scaled(255);
    }

    static parseSegmentsAsTrailingRGB(segments) {
        return segments.map((segment) => new RGBA(segment[3] ?? 1, segment[4] ?? 1, segment[5] ?? 1, 1).scaled(255))
    }

    static parseSegmentAsTrailingRGB(segment) {
        return new RGBA(segment[3] ?? 1, segment[4] ?? 1, segment[5] ?? 1, 1).scaled(255);
    }

    static filterSegmentObjectsByKeyword(segmentObjects, keyword) {
        return segmentObjects.filter((segmentObject) => segmentObject.keyword == keyword)
    }

    static filterSegmentObjectsByKeywords(segmentObjects, keywords) {
        return segmentObjects.filter((segmentObject) => keywords.includes(segmentObject.keyword));
    }

    static parseSegmentObjectsAsValues(segmentObjects) {
        return segmentObjects.map((segmentObject) => segmentObject.values.map(MtlFileParser.parseStringifiedValue));
    }

    static parseStringifiedValue(value) {
        if (!isNaN(value)) {
            return Number(value);
        } else {
            return value;
        }
    }
}

class ObjFileParser extends FileParser {
    static segmentDelimiter = /\s*?\r?\n|\s+\n/;
    static valueDelimiter = /\s+/;
    static vertexIndexDelimiter = /[/]/;

    static async readFiles(files) {
        try {
            let parsedModelData = [];

            for (let i = 0; i < files.length; i++) {
                let file = files[i];

                let data = await ObjFileParser.readFile(file);

                parsedModelData[i] = data;
            }

            return parsedModelData;
        } catch (error) {
            Terminal.error(error);
        }
    }

    static async readFile(file) {
        let data = await new Promise((resolve) => {
            let reader = new FileReader();

            reader.onload = (e) => {
                resolve(ObjFileParser.readText(reader.result));
            }

            reader.readAsText(file);
        });

        return new ParsedObj(file.name, data.vertices, data.mtlFileName);
    }

    static readText(text) {
        try {
            let segments = ObjFileParser.splitTextIntoSegments(text);
            let segmentObjects = ObjFileParser.parseSegmentsIntoObjects(segments);

            let materialFileNames = ObjFileParser.parseSegmentObjectsAsValues(ObjFileParser.filterSegmentObjectsByKeyword(segmentObjects, "mtllib"));
            let vertexPositionSegments = ObjFileParser.parseSegmentObjectsAsValues(ObjFileParser.filterSegmentObjectsByKeyword(segmentObjects, "v"));
            let textureCoordinateSegments = ObjFileParser.parseSegmentObjectsAsValues(ObjFileParser.filterSegmentObjectsByKeyword(segmentObjects, "vt"));
            let normalSegments = ObjFileParser.parseSegmentObjectsAsValues(ObjFileParser.filterSegmentObjectsByKeyword(segmentObjects, "vn"));

            let materialFileName = materialFileNames[materialFileNames.length - 1].join(" ") ?? "";
            let vertexPositions = ObjFileParser.parseSegmentsAsVector3(vertexPositionSegments);
            let colors = ObjFileParser.parseSegmentsAsTrailingRGB(vertexPositionSegments);
            let textureCoordinates = ObjFileParser.parseSegmentsAsVector2(textureCoordinateSegments);
            let normals = ObjFileParser.parseSegmentsAsVector3(normalSegments);

            let vertices = [];

            let vConfigSegments = ObjFileParser.filterSegmentObjectsByKeywords(segmentObjects, ["f", "usemtl"]);

            let currentMaterialName;

            for (let i = 0; i < vConfigSegments.length; i++) {
                let vConfigSegment = vConfigSegments[i];

                if (vConfigSegment.keyword == "usemtl") {
                    currentMaterialName = vConfigSegment.values.join(" ");
                } else if (vConfigSegment.keyword == "f") {
                    if (!currentMaterialName) {
                        continue;
                    }

                    let face = vConfigSegment.values.map((vis) => vis.split(ObjFileParser.vertexIndexDelimiter));

                    for (let j = 0; j < face.length - 2; j++) {
                        let vi1 = j;
                        let vi2 = j + 1;
                        let vi3 = j + 2;

                        if (face.length > 3) {
                            vi1 = 0;
                        }

                        let vis1 = face[vi1].map((coord) => coord - 1);
                        let vis2 = face[vi2].map((coord) => coord - 1);
                        let vis3 = face[vi3].map((coord) => coord - 1);

                        vertices.push(
                            new Vertex(
                                {
                                    position: vertexPositions[vis1[0]],
                                    textureCoordinate: textureCoordinates[(vis1[1] ?? 1)] ?? Vector2.neutral(),
                                    normal: normals[(vis1[2] ?? 1)] ?? Vector3.neutral(),
                                    materialName: currentMaterialName,
                                    color: colors[vis1[0]],
                                }
                            ),
                            new Vertex(
                                {
                                    position: vertexPositions[vis2[0]],
                                    textureCoordinate: textureCoordinates[(vis2[1] ?? 1)] ?? Vector2.neutral(),
                                    normal: normals[(vis2[2] ?? 1)] ?? Vector3.neutral(),
                                    materialName: currentMaterialName,
                                    color: colors[vis2[0]],
                                }
                            ),
                            new Vertex(
                                {
                                    position: vertexPositions[vis3[0]],
                                    textureCoordinate: textureCoordinates[(vis3[1] ?? 1)] ?? Vector2.neutral(),
                                    normal: normals[(vis3[2] ?? 1)] ?? Vector3.neutral(),
                                    materialName: currentMaterialName,
                                    color: colors[vis3[0]],
                                }
                            ),
                        );
                    }
                }
            }

            return {
                mtlFileName: materialFileName,
                vertices: vertices,
            };
        } catch (error) {
            Terminal.error(error);
        }
    }

    static splitTextIntoSegments(text) {
        return text.split(ObjFileParser.segmentDelimiter).filter((segment) => segment.length > 0);
    }

    static parseSegmentsIntoObjects(segments) {
        return segments.map(MtlFileParser.parseSegmentIntoObject);
    }

    static parseSegmentIntoObject(segment) {
        let values = segment.split(ObjFileParser.valueDelimiter).filter((value) => value.length > 0);
        let keyword = values.shift();

        return {keyword: keyword, values: values};
    }
}

class MtlFileParser extends FileParser {
    static segmentDelimiter = /\s*?\r?\n|\s+\n/;
    static valueDelimiter = /\s+/;
    static vertexIndexDelimiter = /[/]/;

    static async readFiles(files) {
        try {
            let materialGroups = {};

            for (let i = 0; i < files.length; i++) {
                let file = files[i];

                let material = await MtlFileParser.readFile(file);                

                materialGroups[file.name] = material;
            }

            return materialGroups;
        } catch (error) {
            Terminal.error(error);
        }
    }

    static async readFile(file) {
        let materials = await new Promise((resolve) => {
            let reader = new FileReader();

            reader.onload = (e) => {
                resolve(MtlFileParser.readText(reader.result));
            }

            reader.readAsText(file);
        });

        return new ParsedMtl(file.name, materials);
    }

    static readText(text) {
        try {
            let segments = MtlFileParser.splitTextIntoSegments(text);
            let segmentObjects = MtlFileParser.parseSegmentsIntoObjects(segments);

            let materialSegmentObjects = {};
            let currentMaterialName;

            for (let i = 0; i < segmentObjects.length; i++) {
                let segmentObject = segmentObjects[i];

                if (segmentObject.keyword == "newmtl") {
                    currentMaterialName = segmentObject.values.join(" ");

                    materialSegmentObjects[currentMaterialName] = [];
                } else {
                    if (!currentMaterialName) {
                        continue;
                    }

                    materialSegmentObjects[currentMaterialName].push(segmentObject);
                }
            }

            let materialNames = Object.keys(materialSegmentObjects);
            let materials = {};

            for (let i = 0; i < materialNames.length; i++) {
                let materialName = materialNames[i];

                let cSegmentObjects = materialSegmentObjects[materialName];

                // Ka = material ambient (color)
                // Kd = material diffuse (color)
                // Ks = material specular (color)
                // Ke = material emmissive coefficient (vec3)
                // Ns = material specular exponent (float)
                // Ni = optical density (float)
                // d = material dissolve (float)
                // illum = illumination mode (float)

                let parsingFunctions = {
                    "Ka": MtlFileParser.parseSegmentAsRGB,
                    "Kd": MtlFileParser.parseSegmentAsRGB,
                    "Ks": MtlFileParser.parseSegmentAsRGB,
                    "Ke": MtlFileParser.parseSegmentAsVector3,
                    "Ns": MtlFileParser.parseSegmentAsFloat,
                    "Ni": MtlFileParser.parseSegmentAsFloat,
                    "d": MtlFileParser.parseSegmentAsFloat,
                    "illum": MtlFileParser.parseSegmentAsFloat,
                };
                let targetKeywords = Object.keys(parsingFunctions);
                
                let materialData = {};

                for (let j = 0; j < cSegmentObjects.length; j++) {
                    let {keyword, values} = cSegmentObjects[j];

                    if (targetKeywords.includes(keyword)) {
                        let parsedValues = parsingFunctions[keyword](values);

                        materialData[keyword] = parsedValues;
                    }
                }

                materials[materialName] = new Material(materialName, materialData);
            }

            return materials;
        } catch (error) {
            Terminal.error(error);
        }
    }

    static splitTextIntoSegments(text) {
        return text.split(MtlFileParser.segmentDelimiter).filter((segment) => segment.length > 0);
    }

    static parseSegmentsIntoObjects(segments) {
        return segments.map(MtlFileParser.parseSegmentIntoObject);
    }

    static parseSegmentIntoObject(segment) {
        let values = segment.split(MtlFileParser.valueDelimiter).filter((value) => value.length > 0);
        let keyword = values.shift();

        return {keyword: keyword, values: values};
    }
}