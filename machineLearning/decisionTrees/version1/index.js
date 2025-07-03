class DecisionTree {
    constructor(data) {
        this.data = data;

        this.order = Array.from(new Array(data[0].inputs.length)).map((a, index) => index).sort((a) => Math.random() - 0.5);

        this.setup();
    }

    setup() {
        let data = this.data;

        let tree = {};

        for (let i = 0; i < data.length; i++) {
            let {inputs, outputs} = data[i];
            let inputsLength = inputs.length;

            inputs = this.sortInputs(inputs);
            
            let branch = tree;

            for (let j = 0; j < inputsLength; j++) {
                let selInput = inputs[j];

                if (selInput in branch) {
                    branch = branch[selInput];
                } else {
                    if (j < inputs.length - 1) {
                        branch = branch[selInput] = {};
                    } else {
                        branch = branch[selInput] = [];
                    }
                }
            }

            branch.push(outputs);
        }

        tree = reduceTree(tree);

        this.tree = tree;
    }

    process(inputs) {
        inputs = this.sortInputs(inputs);

        let tree = this.tree;

        let branch = tree;

        for (let i = 0; i < inputs.length; i++) {
            let input = inputs[i];

            if (input in branch) {
                branch = branch[input];
            } else {
                let nearest = Object.keys(branch).sort((a, b) => inputSimilarity(a, input) - inputSimilarity(b, input))[0];

                branch = branch[nearest];
            }
        }

        return branch;
    }

    sortInputs(inputs) {
        let list = Array.from(new Array(inputs.length)).map((a, index) => {return {
            input: inputs[index],
            order: this.order[index],
        }});

        return list.sort((a, b) => a.order - b.order).map((a) => a.input);
    }
}

class RandomForestClassifier {
    constructor(data, numPartitions, preRandomised = true) {
        this.data = preRandomised ? data : data.toSorted((a) => Math.random() - 0.5);
        this.numPartitions = numPartitions;

        this.setup();
    }

    setup() {
        let data = this.data;
        let numPartitions = this.numPartitions;
        let partitionLength = Math.floor(data.length / numPartitions);

        let forest = [];

        for (let i = 0; i < numPartitions; i++) {
            let dataSubset = data.slice(i * partitionLength, (i + 1) * partitionLength);

            let tree = new DecisionTree(dataSubset);

            forest[i] = tree;
        }

        this.forest = forest;
    }

    process(inputs) {
        let numPartitions = this.numPartitions;
        let forest = this.forest;

        let leafs = [];

        for (let i = 0; i < numPartitions; i++) {
            let tree = forest[i];
            let leaf = tree.process(inputs);
            
            leafs.push(leaf);
        }

        let numOutputs = leafs[0].length;

        let final;

        if (Array.isArray(leafs[0])) {
            final = correspondingIndicesMode(leafs, numOutputs);
        } else {
            final = leafs.reduce((sum, value) => sum + value) / numPartitions;
        }

        return final;
    }
}

let gHeaders = [];
let gExtraDataHeaders = [];
let gInputHeaders = [];
let gOutputHeaders = [];

let trainingData = [];
let testingData = [];

let gForest;

let gUseHeaders = true;
let gPercentTestingSamples = 0.2; 
let gSegmentDelimiter = /[\n]/;
let gValueDelimiter = /[,|;]/;

let gNumPartitions = 30;

function onload() {
    try {
        Terminal.init();
        Terminal.hide();

        setNumPartitions(gNumPartitions);
    } catch (error) {
        alert(error.stack);
    }
}

function loadData(file) {
    let reader = new FileReader();

    reader.onload = (e) => {
        let {headers, extraDataHeaders, inputHeaders, outputHeaders, data} = parseTextAsData(e.target.result);
        
        gHeaders = headers;
        gExtraDataHeaders = extraDataHeaders;
        gInputHeaders = inputHeaders;
        gOutputHeaders = outputHeaders;

        trainingData = data.toSorted((a) => Math.random() - 0.5);
        testingData = trainingData.splice(0, Math.floor(trainingData.length * gPercentTestingSamples));

        loadHeaders();
    }

    reader.readAsText(file);
}

function loadTestingData(file) {
    let reader = new FileReader();

    reader.onload = (e) => {
        let {data} = parseTextAsData(e.target.result);
        testingData = data;

        test();
    }

    reader.readAsText(file);
}

function parseTextAsData(text) {
    try {
        let benchmarker = new Benchmarker("Time to Parse File (ms)");

        let headers = [];
        let extraDataHeaders = [];
        let inputHeaders = [];
        let outputHeaders = [];
        let data = [];

        let metadata = {};

        let segments = text.split(gSegmentDelimiter).filter((segment) => segment.length > 0);

        if (segments[0].charAt(0) == "#") {
            while (segments[0].charAt(0) == "#") {
                let segment = segments.shift();
                let values = segment.split(gValueDelimiter).filter((segment) => segment.length > 0);
                
                let metadataKey = values.shift().substring(1);
                let metadataValues = values.map(parseStringifiedValues);

                metadata[metadataKey] = metadataValues;
            }
        }

        if (gUseHeaders) {
            let segment = segments.shift();

            ({extraData: extraDataHeaders, inputs: inputHeaders, outputs: outputHeaders, concat: headers} = processDataSegment(metadata, segment));
        }

        benchmarker.updateCurrentTime();

        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i];
            
            data[i] = processDataSegment(metadata, segment);

            benchmarker.add();
        }

        Terminal.print(benchmarker.toString(2));

        return {headers: headers, extraDataHeaders: extraDataHeaders, inputHeaders: inputHeaders, outputHeaders: outputHeaders, data: data};

        function processDataSegment(metadata, segment) {
            let values = segment.split(gValueDelimiter);
            
            let extraData = [];
            let inputs = [];
            let outputs = [];

            if (metadata["extraData"] ?? 1) {
                let extraDataFilter = metadata.extraDataFilter ?? [];
                let extraDataNum = metadata["extraDataNum"] ?? extraDataFilter.length;
                extraData = filterValues(values.splice(0, extraDataNum), extraDataFilter).map(parseStringifiedValues);
            }
            if (metadata["inputs"] ?? 1) {
                let inputsFilter = metadata.inputsFilter ?? [];
                let inputsNum = metadata["inputsNum"] ?? inputsFilter.length;
                inputs = filterValues(values.splice(0, inputsNum), inputsFilter).map(parseStringifiedValues);
            }
            if (metadata["outputs"] ?? 1) {
                let outputsFilter = metadata.outputsFilter ?? [];
                let outputsNum = metadata["outputsNum"] ?? outputsFilter.length;
                outputs = filterValues(values.splice(0, outputsNum), outputsFilter).map(parseStringifiedValues);
            }

            let concat = extraData.concat(inputs).concat(outputs);

            return {
                extraData: extraData,
                inputs: inputs,
                outputs: outputs,
                concat: concat,
            }
        }
    } catch (error) {
        alert(error.stack);
    }
}

function setNumPartitions(numPartitions) {
    gNumPartitions = numPartitions;

    document.getElementById('numPartitionsLabel').innerHTML = "Number of Forest Partitions: " + gNumPartitions;
    document.getElementById('numPartitionsInput').value = gNumPartitions;
}

function shuffleData() {
    trainingData.sort((a) => Math.random() - 0.5);
}

function loadHeaders() {
    let accuracyTable = document.getElementById('accuracyTable');
    let dataTable = document.getElementById('dataTable');

    accuracyTable.innerHTML = "";
    dataTable.innerHTML = "";

    if (gUseHeaders) {
        accuracyTable.appendChild(createTableRow(gOutputHeaders));
        dataTable.appendChild(createTableRow(gInputHeaders.concat(gOutputHeaders)));
    }
}

function findBestNumPartitions() {
    try {
        let minPartitions = 1;
        let maxPartitions = 50;
        let attempts = 1;

        let highestAccuracy = 0;
        let highestAccuracyPartitions = gNumPartitions;

        for (let p = minPartitions; p < maxPartitions; p++) {
            for (let a = 0; a < attempts; a++) {
                let forest = new RandomForestClassifier(trainingData, p);

                let accuracy = getAccuracy(forest);

                if (accuracy > highestAccuracy) {
                    highestAccuracy = accuracy;
                    highestAccuracyPartitions = p;
                }
            }
        }

        setNumPartitions(highestAccuracyPartitions);
    } catch (error) {
        Terminal.error(error);
    }
}

function findBestForest() {
    let iterations = 10;

    let forests = [];

    for (let i = 0; i < iterations; i++) {
        shuffleData();

        let forest = new RandomForestClassifier(trainingData, gNumPartitions);
        let accuracy = getAccuracy(forest);

        forests[i] = {
            forest: forest,
            accuracy: accuracy,
        }
    }

    forests.sort((a, b) => b.accuracy - a.accuracy);

    gForest = forests[0].forest;
}

function getAccuracy(forest) {
    let dataAccuracy = [];

    for (let i = 0; i < testingData.length; i++) {
        let {inputs, outputs} = testingData[i];
        let predictedOutputs = forest.process(inputs);

        for (let j = 0; j < outputs.length; j++) {
            dataAccuracy[j] = (dataAccuracy[j] ?? 0) + (predictedOutputs[j] == outputs[j]) / testingData.length;
        }
    }

    return dataAccuracy.reduce((sum, value) => sum + value);
}

function trainAndStart() {
    train();
    test();
}

function train() {
    findBestNumPartitions();
    findBestForest();

    Terminal.print("Trained!");
}

function test() {
    try {
        let accuracyTable = document.getElementById('accuracyTable');
        let dataTable = document.getElementById('dataTable');

        loadHeaders();

        let dataAccuracy = [];

        if (gForest == undefined) {
            gForest = new RandomForestClassifier(trainingData, gNumPartitions);
        }

        for (let i = 0; i < testingData.length; i++) {
            let {inputs, outputs} = testingData[i];

            let predictedOutputs = gForest.process(inputs);
            
            let rowContent = inputs.concat(predictedOutputs);
            dataTable.appendChild(createTableRow(rowContent));

            for (let j = 0; j < outputs.length; j++) {
                dataAccuracy[j] = (dataAccuracy[j] ?? 0) + (predictedOutputs[j] == outputs[j] ? 1 : 0) / testingData.length;
            }
        }

        accuracyTable.appendChild(createTableRow(dataAccuracy.map((a) => Number(a.toFixed(2)))));

        Terminal.print("Tested!");
    } catch (error) {
        Terminal.error(error);
    }
}

function createTableRow(source) {
    let tr = document.createElement('tr');

    source.forEach((value) => {
        let td = document.createElement('td');
        td.innerHTML = value;

        tr.appendChild(td);
    });

    return tr;
}

function reduceTree(input) {
    if (Array.isArray(input)) {
        return correspondingIndicesMode(input);
    } else {
        for (let branch in input) {
            input[branch] = reduceTree(input[branch]);
        }

        return input;
    }
}

function inputSimilarity(input, target) {
    if (typeof input === "string" && typeof target === "string") {
        return stringSimilarity(input, target);
    } else {
        return numberSimilarity(input, target);
    }
}

function stringSimilarity(input, target) {
    let m = input.length;
    let n = target.length;

    if (m == 0) {
        return n;
    } else if (n == 0) {
        return m;
    }

    let matrix = [];

    for (let i = 0; i <= m; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= n; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (input.charAt(i - 1) == target.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = 1 + Math.min(matrix[i][j - 1], matrix[i - 1][j], matrix[i - 1][j - 1]);
            }
        }
    }

    return matrix[m][n];
}

function numberSimilarity(input, target) {
    return Math.abs(input - target);
}

function correspondingIndicesMean(input, innerLength = input[0].length, outerLength = input.length) {
    return Array.from(new Array(innerLength)).map((placeholder, index) => input.map((a) => a[index]).reduce((sum, value) => sum + value) / outerLength).map(Math.ceil);
}

function correspondingIndicesMode(input, innerLength = input[0].length) {
    let result = [];

    let reshaped = Array.from(new Array(innerLength)).map((placeholder, index) => input.map((a) => a[index]));

    for (let i = 0; i < reshaped.length; i++) {
        let outputSet = reshaped[i];

        let occurances = {};

        for (let j = 0; j < outputSet.length; j++) {
            let value = outputSet[j];

            if (value in occurances) {
                occurances[value]++
            } else {
                occurances[value] = 1;
            }
        }
        
        let mostFrequent = Object.entries(occurances).reduce((maxKey, [key, value]) => {
            if (maxKey === null || value > occurances[maxKey]) {
                return key;
            }
            return maxKey;
        }, null);

        result[i] = mostFrequent;
    }

    return result;
}

function splitTextIntoSegments(text, delimiter, numPerSegment) {
    let segments = [];

    for (let i = 0; i < text.length; i++) {
        let startIndex = i;

        let count = 0;

        while (count < numPerSegment && i < text.length) {
            let char = text.charAt(i);

            if (char == delimiter) {
                count++;
            }

            if (count != numPerSegment) {
                i++;
            }
        }

        segments.push(text.substring(startIndex, i + 1))
    }

    return segments;
}

function parseStringifiedValues(value) {
    if (!isNaN(value)) {
        return Number(value);
    } else {
        return value;
    }
}

function filterValues(values, filter) {
    return values.filter((a, index) => filter[index] ?? 1);
}