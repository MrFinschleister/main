class Terminal {
    static collapsed = false;

    static defaultColorArr = [0, 0, 0, 0.9];
    static colorArr = [0, 0, 0, 0.1];

    static defaultTextColorArr = [255, 255, 255, 1];
    static textColorArr = [255, 255, 255, 1];

    static dimensions = [30, 90, 28, 2, 28, 81];
    static inset = ["1vh", "1vh", "auto", "auto"];
    static inInset = ["auto", "auto", "1vh", "1vw"];
    static outInset = ["1vw", "auto", "auto", "1vw"];

    static recentCommands = [];
    static recentCommandIndex = 0;


    // INITIALISATION


    static init() {
        Terminal.initEl();
        Terminal.initIn();
        Terminal.initOut();
        Terminal.defaultSize();
        Terminal.defaultInset();
        Terminal.defaultSecondaryInsets();
        Terminal.defaultColor();
        Terminal.defaultTextColor();

        document.body.appendChild(Terminal.el);
        Terminal.el.appendChild(Terminal.out);
        Terminal.el.appendChild(Terminal.in);

        Terminal.clear();
    }

    static initEl() {
        let el = document.createElement('div');

        el = document.createElement("div");
        el.id = "terminal";
        el.style.position = "fixed";
        el.style.overflow = "hidden hidden";
        el.style.border = "1px solid";

        Terminal.el = el;
    }

    static initIn() {
        let input = document.createElement('input');

        input.placeholder = "Input Command";
        input.type = "text";
        input.style.position = "absolute";
        input.style.backgroundColor = "rgba(30, 30, 30, 1)";
        input.style.border = "0";

        input.onkeydown = (e) => {Terminal.inputKeydown(e)};

        Terminal.in = input;
    }

    static initOut() {
        let output = document.createElement("div");

        output.style.position = "absolute";
        output.style.overflow = "clip scroll";

        Terminal.out = output;
    }

    
    // APPEARANCE COMMANDS


    static defaultSize() {
        Terminal.setSize(...Terminal.dimensions)
    }

    static setSize(elWidth, elHeight, inWidth, inHeight, outWidth, outHeight) {
        Terminal.el.style.width = elWidth + "vw";
        Terminal.el.style.height = elHeight + "vh";

        Terminal.in.style.width = inWidth + "vw";
        Terminal.in.style.height = inHeight + "vh";

        Terminal.out.style.width = outWidth + "vw";
        Terminal.out.style.height = outHeight + "vh";
    }

    static defaultColor() {
        Terminal.setColor(Terminal.defaultColorArr);
    }

    static setColor(color) {
        Terminal.colorArr = color;

        let rgba = `rgba(${color.join(",")}`;

        Terminal.el.style.backgroundColor = rgba;
        Terminal.el.style.borderColor = rgba;
        Terminal.in.style.backgroundColor = rgba;
        Terminal.out.style.backgroundColor = rgba;
    }

    static defaultTextColor() {
        Terminal.setTextColor(Terminal.defaultTextColorArr);
    }

    static setTextColor(textColor) {
        Terminal.textColorArr = textColor;

        let rgba = `rgba(${textColor.join(",")})`;

        Terminal.in.style.color = rgba;
        Terminal.out.style.color = rgba;
        Terminal.print(`Text color set to: ${textColor}`)
    }

    static defaultOpacity() {
        Terminal.setOpacity(Terminal.defaultColorArr[3]);
    }

    static setOpacity(opacity) {
        Terminal.colorArr[3] = opacity;
        Terminal.setColor(Terminal.colorArr);
        Terminal.print(`Opacity set to: ${opacity}`);
    }

    static defaultInset() {
        Terminal.el.style.inset = Terminal.inset.join(" ");
    }

    static setInset(inset) {
        Terminal.el.style.inset = inset.join(" ");
        Terminal.print(`Inset set to: ${Terminal.inset}`);
    } 

    static defaultSecondaryInsets() {
        Terminal.setSecondaryInsets(Terminal.inInset, Terminal.outInset);
    }

    static setSecondaryInsets(inInset, outInset) {
        Terminal.in.style.inset = inInset.join(" ");
        Terminal.out.style.inset = outInset.join(" ");

        Terminal.print(`Secondary insets set to: (in) ${Terminal.inInset} (out) ${Terminal.outInset}`);
    }


    // UTILITY COMMANDS
    

    static eval(content) {
        eval(content[0]);
    }

    static collapse() {
        if (Terminal.collapsed) {
            Terminal.el.style.height = "90vh";
        } else {
            Terminal.el.style.height = "5vh";
        }

        Terminal.collapsed = !Terminal.collapsed;
    }

    static toggleVisibility() {
        if (Terminal.visible) {
            Terminal.hide();
        } else {
            Terminal.show();
        }
    }

    static show() {
        Terminal.el.style.display = "inline";

        Terminal.visible = true;
    }

    static hide() {
        Terminal.el.style.display = "none";

        Terminal.visible = false;
    }

    static fuck() {
        document.head.remove();
        document.body.remove();
    }
    
    static formatText(text) {
        if (Array.isArray(text)) {
            text = text.join(", ");
        }

        return String(text).split(/[ ]/g).join("&nbsp;").replace(/[\n]/g, "<br>");
    }

    static unformatText(text) {
        return text.split("&nbsp;").join(" ").split("<br>").join("\n")
    }

    static print(text) {
        let adjustedText = Terminal.formatText(text);
        
        let p = document.createElement('p');

        p.innerHTML = adjustedText;
        p.style.height = "fit-content";
        p.style.wordBreak = "break-all";
        p.style.display = "block";

        Terminal.out.appendChild(p);
    }

    static printLink(text, link, fileName) {
        let adjustedText = Terminal.formatText(text);

        let a = document.createElement('a');
        
        a.innerHTML = adjustedText;
        a.style.height = "fit-content";
        a.style.wordBreak = "break-all";
        a.style.display = "block";
        a.style.textDecoration = "none";
        a.href = link;
        a.target = "_blank";

        if (fileName) {
            a.download = fileName;
        }

        Terminal.out.appendChild(a);
    }

    static presetPrintLink(text, content, fileName) {
        let urlBase = new Blob([content], { type: "text/plain" });
        let url = URL.createObjectURL(urlBase);

        Terminal.printLink(text + " - " + urlBase.size.toLocaleString() + " bytes", url, fileName);
    }

    static printElement(element) {
        Terminal.out.appendChild(element);
    }

    static newLine() {
        Terminal.print("<br>");
    }

    static inputCommand(command) {
        Terminal.clearInput();

        try {
            let comm = command.split(" ");

            let commandName = comm[0];
            let parameters = comm.slice(1);

            if (Terminal[commandName]) {
                let result = Terminal[commandName](parameters);

                if (result) {
                    Terminal.print(result);
                } 

                Terminal.recentCommands.push(command);
                Terminal.recentCommandIndex = Terminal.recentCommands.length;
            } else {
                Terminal.print(`\"${commandName}\" not a valid command`);
            }
        } catch (error) {
            Terminal.error(error);
        }
    }

    static inputKeydown(e) {
        let code = e.code;

        if (code == "Enter") {
            Terminal.inputCommand(Terminal.in.value);
        } else if (code == "ArrowUp") {
            if (Terminal.recentCommandIndex > 0) {
                Terminal.recentCommandIndex--;
                Terminal.useRecentCommand();
            }
        } else if (code == "ArrowDown") {
            if (Terminal.recentCommandIndex < Terminal.recentCommands.length - 1) {
                Terminal.recentCommandIndex++;
                Terminal.useRecentCommand();
            } else {
                Terminal.clearInput();
            }
        }
    }

    static useRecentCommand() {
        Terminal.in.value = Terminal.recentCommands[Terminal.recentCommandIndex];
    }

    static clearInput() {
        Terminal.in.value = "";
    }

    static error(error) {
        Terminal.show();

        let stack = error.stack.split(":");
        let fileFull = stack[2].split("/");
        let file = fileFull[fileFull.length - 1];

        let row = stack[3];
        let column = stack[4].split(')')[0];

        let output = error + "<br>        " + file + " - " + row + ":" + column;

        let urlBase = new Blob([error.stack], { type: "text/plain" });
        let url = URL.createObjectURL(urlBase);

        Terminal.print(output);
        Terminal.printLink("       ~ view full ~", url);
    }

    static clear() {
        Terminal.out.innerHTML = "";
    }

    static generateSaveLink(fileName) {
        if (fileName == "") {
            fileName = undefined;
        }

        let children = Terminal.out.getElementsByTagName('p');

        let output = [];

        for (let child of children) {
            output.push(Terminal.unformatText(child.innerHTML));
        }

        Terminal.presetPrintLink("Save Terminal Content", output.join("\n"), fileName);
    }
}

class Benchmarker {
    constructor(name, time = performance.now()) {
        this.name = name;
        this.benchmarks = [];
        
        this.initializationTime = time;
        this.currentTime = time;
    }

    toString(precision = 20) {
        let averageRelativeTime = parseFloat(this.averageRelativeTime().toFixed(precision));
        let fromInitialization = parseFloat(this.fromInitialization().toFixed(precision));

        return "~~ Benchmarker ~~\n   Name: " + this.name + "\n   Average Relative Time: " + averageRelativeTime + "\n   Total Time: " + fromInitialization;
    }

    reset() {
        let time = performance.now();

        this.benchmarks = [];

        this.initializationTime = time;
        this.currentTime = time;
    }
    
    updateCurrentTime() {
        this.currentTime = performance.now();
    }

    setCurrentTime(currentTime) {
        this.currentTime = currentTime;
    }

    add() {
        let absoluteTime = performance.now();
        let relativeTime = absoluteTime - this.currentTime;

        this.currentTime = absoluteTime;

        let newBenchmark = new Benchmark(absoluteTime, relativeTime);

        this.benchmarks.push(newBenchmark);
    }

    averageAbsoluteTime() {
        return this.totalAbsoluteTime() / this.benchmarks.length;
    }

    averageRelativeTime() {
        return this.totalRelativeTime() / this.benchmarks.length;
    }

    totalRelativeTime() {
        let benchmarks = this.benchmarks;

        let sum = 0;

        for (let i = 0; i < benchmarks.length; i++) {
            let currentBenchmark = benchmarks[i];
            let relativeTime = currentBenchmark.relativeTime;

            sum += relativeTime;
        }

        return sum;
    }

    totalAbsoluteTime() {
        return this.currentTime - this.initializationTime;
    }

    printBenchmarks(printFn) {
        let benchmarks = this.benchmarks;

        for (let i = 0; i < benchmarks.length; i++) {
            let currentBenchmark = benchmarks[i];
            let currentBenchmarkString = currentBenchmark.toString();

            printFn(currentBenchmarkString);
        }
    }

    fromInitialization() {
        return performance.now() - this.initializationTime;
    }

    currentToNow() {
        return performance.now() - this.currentTime;
    }

    regress() {
        let benchmarks = this.benchmarks;

        let datapoints = [];

        for (let i = 0; i < benchmarks.length; i++) {
            datapoints.push([i, benchmarks[i].relativeTime]);
        }

        let regressionCalculator = new RegressionCalculator(datapoints);
        let fn = regressionCalculator.getBestRegression();

        return fn;
    }
}

class Benchmark {
    constructor(absoluteTime, relativeTime) {
        this.absoluteTime = absoluteTime;
        this.relativeTime = relativeTime;
    }

    toString() {
        return this.name + ": \n ~ Absolute Time: " + this.absoluteTime + "\n ~ Relative Time: " + this.relativeTime;
    }
}

class Matrix {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;

        this.matrix = [];
        this.setZero();
    }

    static from(rows, columns, src) {
        let newMatrix = new Matrix(rows, columns);
        newMatrix.set(src);

        return newMatrix;
    }

    static identity(dimensions) {
        let arr = [];

        for (let i = 0; i < dimensions; i++) {
            arr[i] = [];
            for (let j = 0; j < dimensions; j++) {
                let value = i == j ? 1 : 0;
                
                arr[i][j] = value;
            }
        }

        let newMatrix = Matrix.from(dimensions, dimensions, arr);

        return newMatrix;
    }

    static random(rows, columns) {
        let arr = [];

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                row[j] = Math.random();
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    static rotation2D(theta = 0) {
        if (Array.isArray(theta)) {
            theta = theta[0];
        }

        let arr = [
            [Math.cos(theta), -Math.sin(theta)],
            [Math.sin(theta),  Math.cos(theta)],
        ];

        let newMatrix = Matrix.from(2, 2, arr);

        return newMatrix;
    }

    static rotation3D(alpha = 0, beta = alpha, gamma = beta) {
        if (Array.isArray(alpha)) {
            gamma = alpha[2];
            beta = alpha[1];
            alpha = alpha[0];
        }

        let sinA = Math.sin(alpha), cosA = Math.cos(alpha);
        let sinB = Math.sin(beta), cosB = Math.cos(beta);
        let sinG = Math.sin(gamma), cosG = Math.cos(gamma);

        let matrixX = Matrix.from(3, 3, [
            [ 1,    0,     0 ],
            [ 0, cosA, -sinA ],
            [ 0, sinA,  cosA ],
        ]);

        let matrixY = Matrix.from(3, 3, [
            [  cosB, 0, sinB ],
            [  0,    1,    0 ],
            [ -sinB, 0, cosB ],
        ]);

        let matrixZ = Matrix.from(3, 3, [
            [ cosG, -sinG, 0 ],
            [ sinG,  cosG, 0 ],
            [ 0,     0,    1 ]
        ]);

        let newMatrix = matrixX.multiply(matrixY).multiply(matrixZ);

        return newMatrix;
    }

    static translation2D(tX, tY = tX) {
        if (Array.isArray(tX)) {
            tY = tX[1];
            tX = tX[0];
        }

        let newMatrix = Matrix.identity(3);

        newMatrix.setValue(0, 2, tX);
        newMatrix.setValue(1, 2, tY);

        return newMatrix;
    }
    
    static translation3D(tX, tY = tX, tZ = tY) {
        if (Array.isArray(tX)) {
            tZ = tX[2];
            tY = tX[1];
            tX = tX[0];
        }

        let newMatrix = Matrix.identity(4);

        newMatrix.setValue(0, 3, tX);
        newMatrix.setValue(1, 3, tY);
        newMatrix.setValue(2, 3, tZ);

        return newMatrix;
    }

    static affineTransformation2D(rotations, translations) {
        let rotationMatrix;
        let translationMatrix;

        if (Array.isArray(rotations)) {
            rotationMatrix = Matrix.rotation2D(rotations);
        } else {
            rotationMatrix = rotations.clone();
        }

        if (Array.isArray(translations)) {
            translationMatrix = Matrix.translation2D(translations);
        } else {
            translationMatrix = translations.clone();
        }

        translationMatrix.setValue(0, 0, 0);
        translationMatrix.setValue(1, 1, 0);

        rotationMatrix = rotationMatrix.changeDimensionsIdentity(3, 3);
        translationMatrix = translationMatrix.changeDimensionsIdentity(3, 3);

        let newMatrix = rotationMatrix.sum(translationMatrix);

        return newMatrix;
    }

    static affineTransformation3D(rotations, translations) {
        let rotationMatrix;
        let translationMatrix;

        if (Array.isArray(rotations)) {
            rotationMatrix = Matrix.rotation3D(rotations);
        } else {
            rotationMatrix = rotations.clone();
        }

        if (Array.isArray(translations)) {
            translationMatrix = Matrix.translation3D(translations);
        } else {
            translationMatrix = translations.clone();
        }

        rotationMatrix = rotationMatrix.changeDimensionsIdentity(4, 4);
        translationMatrix = translationMatrix.changeDimensionsIdentity(4, 4);

        let newMatrix = rotationMatrix.multiply(translationMatrix);

        return newMatrix;
    }

    static projection3D(fieldOfView, aspect, zNear, zFar) {
        let _00 = 1 / (Math.tan(fieldOfView / 2) * aspect);
        let _11 = 1 / (Math.tan(fieldOfView / 2));
        let _22 = -(zNear + zFar) / (zFar - zNear);
        let _23 = -2 * zFar * zNear / (zFar - zNear);

        let newMatrix = Matrix.from(4, 4, [
            [ _00,   0,   0,   0 ],
            [   0, _11,   0,   0 ],
            [   0,   0, _22, _23 ],
            [   0,   0,  -1,   0 ],
        ]);

        return newMatrix;
    }

    valueOf() {
        return this.matrix;
    }

    float32Array(axis) {
        return new Float32Array(this.flat(axis));
    }

    toString(precision = 20) {
        return this.matrix.map((row) => row.map((element) => parseFloat(element.toFixed(precision))).join(",")).join("\n");
    }

    clone() {
        return Matrix.from(this.rows, this.columns, structuredClone(this.matrix))
    }

    flat(axis = 0) {
        return axis == 0 ? this.matrix.flat() : this.transposed().matrix.flat();
    }

    reshape(rows, columns = rows) {
        let flattened = this.flat();
        let flattenedLength = flattened.length;

        this.rows = rows;
        this.columns = columns;

        let arr = [];

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let index = i + j * rows;

                row[j] = flattened[index % flattenedLength];
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    setZero() {
        this.set([[0]]);
    }

    set(src) {
        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = src.length;
        let columns2 = src[0].length; 

        let arr = [];

        for (let i = 0; i < rows1; i++) {
            let row = [];

            for (let j = 0; j < columns1; j++) {
                row[j] = src[i % rows2][j % columns2];
            }

            arr[i] = row;
        }

        this.matrix = arr;
    }

    getValue(i, j) {
        return this.matrix[i][j];
    }

    setValue(i, j, value) {
        this.matrix[i][j] = value;
    }

    getRow(row) {
        return this.matrix[row];
    }

    getColumn(column) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;

        for (let i = 0; i < rows; i++) {
            arr[i] = src[i][column];
        }

        return arr;
    }

    rowToVector(row) {
        let columns = this.columns;
        let targetRow = this.getRow(row);

        switch (columns) {
            case 2: 
                return Vector2.from(targetRow);

            case 3: 
                return Vector3.from(targetRow);

            case 4: 
                return Vector4.from(targetRow);
        }

        throw new Error("Haven't made that one yet!");
    }

    columnToVector(column) {
        let rows = this.rows;
        let target = this.getColumn(column);

        switch (rows) {
            case 2: 
                return Vector2.from(target);

            case 3: 
                return Vector3.from(target);

            case 4: 
                return Vector4.from(target);
        }

        throw new Error("Haven't made that one yet!");
    }

    scaled(scalar) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j] * scalar;

                row[j] = val;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    sum(matrix2) {
        let src1 = this.matrix;
        let src2 = matrix2.matrix;
        let arr = [];

        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = matrix2.rows;
        let columns2 = matrix2.columns;

        for (let i = 0; i < rows1; i++) {
            let row = [];

            for (let j = 0; j < columns1; j++) {
                let val1 = src1[i][j];
                let val2 = src2[i % rows2][j % columns2];

                row[j] = val1 + val2;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows1, columns1, arr);

        return newMatrix;
    }

    difference(matrix2) {
        let src1 = this.matrix;
        let src2 = matrix2.matrix;
        let arr = [];

        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = matrix2.rows;
        let columns2 = matrix2.columns;

        for (let i = 0; i < rows1; i++) {
            let row = [];

            for (let j = 0; j < columns1; j++) {
                let val1 = src1[i][j];
                let val2 = src2[i % rows2][j % columns2];

                row[j] = val1 - val2;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows1, columns1, arr);

        return newMatrix;
    }

    elementMultiply(matrix2) {
        let src1 = this.matrix;
        let src2 = matrix2.matrix;
        let arr = [];

        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = matrix2.rows;
        let columns2 = matrix2.columns;

        for (let i = 0; i < rows1; i++) {
            let row = [];

            for (let j = 0; j < columns1; j++) {
                let val1 = src1[i][j];
                let val2 = src2[i % rows2][j % columns2];

                row[j] = val1 * val2;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows1, columns1, arr);

        return newMatrix;
    }

    elementDivide(matrix2) {
        let src1 = this.matrix;
        let src2 = matrix2.matrix;
        let arr = [];

        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = matrix2.rows;
        let columns2 = matrix2.columns;

        for (let i = 0; i < rows1; i++) {
            let row = [];

            for (let j = 0; j < columns1; j++) {
                let val1 = src1[i][j];
                let val2 = src2[i % rows2][j % columns2];

                row[j] = val1 / val2;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows1, columns1, arr);

        return newMatrix;
    }

    multiply(matrix2) {
        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = matrix2.rows;
        let columns2 = matrix2.columns;

        if (columns1 != rows2) {
            throw new Error('Inner dimensions not equivilent.');
        }

        let src1 = this.matrix;
        let src2 = matrix2.matrix;
        let newMatrix = new Matrix(rows1, columns2);

        for (let r = 0; r < rows1; r++) {
            for (let c = 0; c < columns2; c++) {
                let sum = 0;

                for (let n = 0; n < columns1; n++) {
                    sum += src1[r][n] * src2[n][c];
                }

                newMatrix.setValue(r, c, sum);
            }
        }

        return newMatrix;
    }

    divide(matrix2) {
        let rows1 = this.rows;
        let columns1 = this.columns;
        let rows2 = matrix2.rows;
        let columns2 = matrix2.columns;

        if (columns1 != rows2) {
            throw new Error('Inner dimensions not equivilent.');
        }

        let src1 = this.matrix;
        let src2 = matrix2.inverse().matrix;
        let newMatrix = new Matrix(rows1, columns2);

        for (let r = 0; r < rows1; r++) {
            for (let c = 0; c < columns2; c++) {
                let sum = 0;

                for (let n = 0; n < columns1; n++) {
                    sum += src1[r][n] * src2[n][c];
                }

                newMatrix.setValue(r, c, sum);
            }
        }

        return newMatrix;
    }

    addNum(num) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j];

                row[j] = val + num;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    subtractNum(num) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j];

                row[j] = val - num;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    multiplyNum(num) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j];

                row[j] = val * num;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    divideNum(num) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j];

                row[j] = val / num;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    invertSigns(start = 0) {
        let src = this.matrix;
        let arr = [];

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let value = src[i][j];

                if ((start + i + j) % 2 != 0) {
                    value *= -1;
                }

                row[j] = value;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    transposed() {
        let src = this.matrix;
        let arr = [];

        let rows = this.rows;
        let columns = this.columns;

        for (let j = 0; j < columns; j++) {
            let column = [];

            for (let i = 0; i < rows; i++) {
                column[i] = src[i][j];
            }

            arr[j] = column;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    complementarySubmatrix(exI, exJ = exI) {
        let arr = [];

        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        let indexI = 0;

        for (let i = 0; i < rows; i++) {
            if (i != exI) {
                let indexJ = 0;

                arr[indexI] = [];

                for (let j = 0; j < columns; j++) {
                    if (j != exJ) {
                        let val = src[i][j];
                        arr[indexI][indexJ] = val;

                        indexJ++;
                    }
                }

                indexI++;
            }
        }

        let newMatrix = Matrix.from(rows - 1, columns - 1, arr);

        return newMatrix;
    }

    determinant() {
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        if (rows != columns) {
            throw new Error("Not a square matrix.");
        }

        if (rows == 1) {
            return src[0][0];
        } else if (rows == 2) {
            let a = src[0][0];
            let b = src[0][1];
            let c = src[1][0];
            let d = src[1][1];
    
            return a * d - b * c;
        } else {
            let val = 0;

            for (let j = 0; j < columns; j++) {
                let coeff = j % 2 == 0 ? 1 : -1;
                let el = src[0][j];
                let complementarySubmatrix = this.complementarySubmatrix(0, j);
                let det = complementarySubmatrix.determinant();

                val += coeff * el * det;
            }

            return val;
        }
    }

    minors() {
        let arr = [];

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let complementarySubmatrix = this.complementarySubmatrix(i, j);
                let det = complementarySubmatrix.determinant();

                row[j] = det;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    inverse() {
        let determinant = this.determinant();
        let minors = this.minors();
        let invertSigns = minors;
        let transposed = invertSigns.transposed().invertSigns(0);

        let inverse = transposed.scaled(1 / determinant);

        return inverse;
    }

    map(fn) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let el = src[i][j];
                let val = fn(el, i, j);

                row[j] = val;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    changeDimensions(targetRows, targetColumns = targetRows, wrap = false) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        if (wrap) {
            for (let i = 0; i < targetRows; i++) {
                let row = [];

                for (let j = 0; j < targetColumns; j++) {
                    row[j] = src[i % rows][j % columns];
                }

                arr[i] = row;
            }
        } else {
            for (let i = 0; i < targetRows; i++) {
                let row = [];

                for (let j = 0; j < targetColumns; j++) {
                    let el;

                    if (i >= rows || j >= columns) {
                        el = 0;
                    } else {
                        el = src[i][j];
                    } 

                    row[j] = el;
                }

                arr[i] = row;
            }
        }

        let newMatrix = Matrix.from(targetRows, targetColumns, arr);

        return newMatrix
    }

    changeDimensionsIdentity(targetRows, targetColumns = targetRows, wrap = false) {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        if (wrap) {
            for (let i = 0; i < targetRows; i++) {
                let row = [];

                for (let j = 0; j < targetColumns; j++) {
                    row[j] = src[i % rows][j % columns];
                }

                arr[i] = row;
            }
        } else {
            for (let i = 0; i < targetRows; i++) {
                let row = [];

                for (let j = 0; j < targetColumns; j++) {
                    let el;

                    if (i >= rows || j >= columns) {
                        if (i == j) {
                            el = 1;
                        } else {
                            el = 0;
                        }
                    } else {
                        el = src[i][j];
                    } 

                    row[j] = el;
                }

                arr[i] = row;
            }
        }

        let newMatrix = Matrix.from(targetRows, targetColumns, arr);

        return newMatrix
    }

    power(power) {
        power = ~~power;

        if (this.rows != this.columns) {
            throw new Error("Matrix is not square.");
        }

        let multiplier;

        if (power > 0) {
            multiplier = this.clone();
        } else if (power < 0) {
            multiplier = this.inverse();
        } else if (power == 0) {
            return Matrix.identity(this.rows);
        }

        let newMatrix = multiplier.clone();

        power = Math.abs(power);

        for (let i = 1; i < power; i++) {
            newMatrix = newMatrix.multiply(multiplier);
        }

        return newMatrix;
    }

    reciprocal() {
        let arr = [];
        let src = this.matrix;

        let rows = this.rows;
        let columns = this.columns;

        for (let i = 0; i < rows; i++) {
            let row = [];

            for (let j = 0; j < columns; j++) {
                let val = src[i][j];

                row[j] = 1 / val;
            }

            arr[i] = row;
        }

        let newMatrix = Matrix.from(rows, columns, arr);

        return newMatrix;
    }

    sumAxis(axis = -1, keepDims = false) {
        let src = this.matrix;
        let newArr = [];

        let rows = this.rows;
        let columns = this.columns;

        if (axis == -1) {
            let sum = 0;

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    sum += src[i][j];
                }
            }

            if (keepDims) {
                return Matrix.from(rows, columns, [[sum]]);
            } else {
                return Matrix.from(1, 1, [[sum]]);
            }
        } else if (axis == 0) {
            newArr[0] = [];

            for (let j = 0; j < columns; j++) {
                let sum = 0;
                
                for (let i = 0; i < rows; i++) {
                    sum += src[i][j];
                }

                newArr[0][j] = sum;
            }
        } else if (axis == 1) {
            for (let i = 0; i < rows; i++) {
                let sum = 0;

                for (let j = 0; j < columns; j++) {
                    sum += src[i][j];
                }

                newArr[i] = [sum];
            }
        }

        let newMatrix;

        if (keepDims) {
            newMatrix = Matrix.from(rows, columns, newArr);
        } else if (axis == 0) {
            newMatrix = Matrix.from(1, columns, newArr);
        } else if (axis == 1) {
            newMatrix = Matrix.from(rows, 1, newArr);
        }

        return newMatrix;
    }
}

class RegressionCalculator {
    constructor(points) {
        this.points = points;

        this.precision = 3;
    }

    // Find all regressions and return the best fit
    getBestRegression() {
        let lin = { type: "linear", equation: this.linearRegression() };
        let quad = { type: "quadratic", equation: this.quadraticRegression() };
        let exp = { type: "exponential", equation: this.exponentialRegression() };

        let equations = [lin, quad, exp];

        equations.sort((a, b) => (this.getSimilarity(b.equation.fn) - this.getSimilarity(a.equation.fn)));

        return equations[0];
    }

    // Return the linear regression of the sample points
    linearRegression() {
        let n = this.points.length;

        let sX = 0;
        let sY = 0;
        let sXY = 0;
        let sXX = 0;
        let sYY = 0;

        for (let i of this.points) {
            let x = i[0];
            let y = i[1];

            sX += x;
            sY += y;

            sXY += x * y;
            sXX += x * x;
            sYY += y * y;
        }

        const sXsYBar = (sX * sY) / n;
        const sXsXBar = (sX * sX) / n;
        const sYsYBar = (sY * sY) / n;

        const xBar = sX / n;
        const yBar = sY / n;

        const numerator = sXY - sXsYBar;
        const denominator = sXX - sXsXBar;
        const rDenom = Math.sqrt((sXX - sXsXBar) * (sYY - sYsYBar));

        const slope = numerator / denominator;
        const intercept = yBar - slope * xBar;
        const r = numerator / rDenom;

        const fn = (x) => { return intercept + slope * x };
        const stringFn = `f(x) = ${parseFloat(intercept.toFixed(this.precision))} + ${parseFloat(slope.toFixed(this.precision))}x`;
        const format = "f(x) = a + bx";
        const equation = { a: intercept, b: slope, r: r, fn: fn, stringFn: stringFn, format: format };

        return equation;
    }

    // Return the exponential regression of the sample points
    exponentialRegression() {
        let newPoints = [];

        for (let i of this.points) {
            if (i[1] != 0) {
                newPoints.push([i[0], Math.log(i[1])]);
            }
        }

        const calculator = new RegressionCalculator(newPoints);
        const linEquation = calculator.linearRegression();

        const fn = (x) => { return Math.pow(Math.E, linEquation.a) * Math.pow(Math.pow(Math.E, linEquation.b), x) };
        const stringFn = `f(x) = ${parseFloat(Math.pow(Math.E, linEquation.a).toFixed(this.precision))} * ${Math.pow(Math.E, linEquation.b).toFixed(this.precision)} ^ x)`;
        const format = "f(x) = ab ^ x";
        const equation = { a: Math.pow(Math.E, linEquation.a), b: Math.pow(Math.E, linEquation.b), r: linEquation.r, fn: fn, stringFn: stringFn, format: format };

        return equation;
    }

    // Return the quadratic regression of the sample points
    quadraticRegression() {
        let n = this.points.length;

        let sX = 0;
        let sY = 0;
        let sX2 = 0;
        let sX3 = 0;
        let sX4 = 0;
        let sXY = 0;
        let sX2Y = 0;

        for (let i of this.points) {
            let x = i[0];
            let y = i[1];

            sX += x;
            sY += y;
            sX2 += x * x;
            sX3 += x * x * x;
            sX4 += x * x * x * x;
            sXY += x * y;
            sX2Y += x * x * y;
        };

        const intermediate = Matrix.from(3, 3, [
            [sX4, sX3, sX2],
            [sX3, sX2, sX],
            [sX2, sX, n],
        ]);

        const output = Matrix.from(3, 1, [
            [sX2Y],
            [sXY],
            [sY],
        ]);

        const inverted = intermediate.inverse();
        Terminal.print(inverted);
        const result = inverted.multiply(output);

        const a = result.getValue(0, 0);
        const b = result.getValue(1, 0);
        const c = result.getValue(2, 0);

        const fn = (x) => { return a * x * x + b * x + c };
        const stringFn = `f(x) = ${a.toFixed(this.precision)}x ^ 2 + ${b.toFixed(this.precision)}x + ${c.toFixed(this.precision)}`;
        const format = "f(x) = ax ^ 2 + bx + c";
        const equation = { a: a, b: b, c: c, fn: fn, stringFn: stringFn, format: format };

        return equation;
    }

    // Find the similarity coefficient between the input function and the sample points
    getSimilarity(fn) {
        const n = this.points.length;

        let sY = 0;
        let sSR = 0;
        let sST = 0;

        for (let i of this.points) {
            let x = i[0];
            let y1 = i[1];
            let y2 = fn(x);

            sY += y1;
            sSR += Math.pow(y1 - y2, 2);
        }

        sY /= n;

        for (let i of this.points) {
            sST += Math.pow(i[1] - sY, 2);
        }

        const r2 = 1 - sSR / sST;

        return r2.toFixed(this.precision);
    }
}

class Vector2 {
    constructor(x = 0, y = x) {
        this.x = x;
        this.y = y;
    }

    static value(value) {
        return new Vector2(value, value);
    }

    static neutral() {
        return new Vector2(0, 0);
    }

    static one() {
        return new Vector2(1, 1);
    }

    static half() {
        return new Vector2(0.5, 0.5);
    }

    static unitRand() {
        let angle = Math.random() * Math.PI * 2;

        return new Vector2(-Math.cos(angle), Math.sin(angle));
    }

    static rand() {
        return new Vector2(Math.random(), Math.random());
    }

    static rotate(angle) {
        return new Vector2(-Math.cos(angle), Math.sin(angle));
    }

    static up() {
        return new Vector2(0, 1);
    }

    static upRand() {
        return new Vector2(0, Math.random());
    }

    static down() {
        return new Vector2(0, -1);
    }

    static downRand() {
        return new Vector2(0, -Math.random());
    }

    static left() {
        return new Vector2(-1, 0);
    }

    static leftRand() {
        return new Vector2(-Math.random(), 0);
    }

    static right() {
        return new Vector2(1, 0);
    }

    static rightRand() {
        return new Vector2(Math.random(), 0);
    }

    static positive() {
        return new Vector2(1, 1);
    }

    static negative() {
        return new Vector2(-1, -1);
    }

    static from(sourceArr) {
        return new Vector2(sourceArr[0], sourceArr[1]);
    }

    toString() {
        return this.x + ", " + this.y;
    }

    valueOf() {
        return this.magnitude();
    }

    array() {
        return [this.x, this.y];
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    set(v2) {
        this.x = v2.x;
        this.y = v2.y;
    }

    zero() {
        this.x = 0;
        this.y = 0;
    }

    // basic operations that reassign values

    add(v2) {
        this.x += v2.x;
        this.y += v2.y;
    }

    subtract(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
    }

    multiply(v2) {
        this.x *= v2.x;
        this.y *= v2.y;
    }

    divide(v2) {
        this.x /= v2.x;
        this.y /= v2.y;
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    normalise() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return;
        } else {
            this.x /= magnitude;
            this.y /= magnitude;
        }
    }

    // basic operations the maintain values and return a new vector

    sum(v2) {
        return new Vector2(this.x + v2.x, this.y + v2.y);
    }

    difference(v2) {
        return new Vector2(this.x - v2.x, this.y - v2.y);
    }

    product(v2) {
        return new Vector2(this.x * v2.x, this.y * v2.y);
    }

    quotient(v2) {
        return new Vector2(this.x / v2.x, this.y / v2.y);
    }

    distance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;

        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }

    squaredDistance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;

        return xDiff * xDiff + yDiff * yDiff;
    }

    scaled(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    normalised() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return new Vector2(0, 0);
        } else {
            return new Vector2(this.x / magnitude, this.y / magnitude);
        }
    }

    // other general operations

    average(v2) {
        return new Vector2((this.x + v2.x) / 2, (this.y + v2.y) / 2);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    dotProd(v2) {
        return this.x * v2.x + this.y * v2.y;
    }

    dotProdSelf() {
        let x = this.x;
        let y = this.y;

        return x * x + y * y;
    }

    crossProd(v2) {
        return this.x * v2.y - this.y * v2.x;
    }

    capNum(num) {
        if (this.x > num) {
            this.x = num;
        } else if (this.x < -num) {
            this.x = -num;
        }

        if (this.y > num) {
            this.y = num;
        } else if (this.y < -num) {
            this.y = -num;
        }
    }

    min(num) {
        if (this.x < num) {
            this.x = num;
        }
        if (this.y < num) {
            this.y = num;
        }
    }

    max(num) {
        if (this.x > num) {
            this.x = num;
        }
        if (this.y > num) {
            this.y = num;
        }
    }

    equals(v2, tolerance) {
        if (tolerance) {
            if (Math.abs(this.x - v2.x) < tolerance && Math.abs(this.y - v2.y) < tolerance) {
                return true;
            }
        } else {
            if (this.x == v2.x && this.y == v2.y) {
                return true;
            }
        }

        return false
    }

    lerp(v2, weight) {
        return this.sum(new Vector2(v2.x - this.x, v2.y - this.y).scaled(weight));
    }

    distance(v2) {
        return this.difference(v2).magnitude();
    }

    rotateRad(theta, origin = Vector2.neutral()) {
        let v1 = this.difference(origin)

        let ct = Math.cos(theta);
        let st = Math.sin(theta);

        v1.x = v1.x * ct - v1.y * st;
        v1.y = v1.x * st + v1.y * ct;

        return v1.sum(origin);
    }

    rounded() {
        return new Vector2(Math.round(this.x), Math.round(this.y));
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }

    floored() {
        return new Vector2(Math.floor(this.x), Math.floor(this.y));
    }

    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
    }

    mod(num) {
        return new Vector2(this.x % num, this.y % num);
    }

    abs() {
        return new Vector2(Math.abs(this.x), Math.abs(this.y));
    }

    greaterThan(v2) {
        return (this.x > v2.x && this.y > v2.y);
    }

    greaterThanEq(v2) {
        return (this.x >= v2.x && this.y >= v2.y);
    }

    lessThan(v2) {
        return (this.x < v2.x && this.y < v2.y);
    }

    lessThanEq(v2) {
        return (this.x <= v2.x && this.y <= v2.y);
    }

    toVector2() {
        return this.clone();
    }

    toVector3() {
        return new Vector3(this.x, this.y, 1);
    }

    toVector4() {
        return new Vector4(this.x, this.y, 1, 1);
    }

    vectorX() {
        return new Vector2(this.x, 0);
    }

    vectorY() {
        return new Vector2(0, this.y);
    }

    toRowMatrix() {
        let newMatrix = Matrix.from(1, 2, [[this.x, this.y]]);
        
        return newMatrix;
    }

    toColumnMatrix() {
        let newMatrix = Matrix.from(2, 1, [[this.x], [this.y]]);

        return newMatrix;
    }
}

class Vector3 {
    constructor(x = 0, y = x, z = y) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static value(value) {
        return new Vector3(value, value, value);
    }

    static neutral() {
        return new Vector3(0, 0, 0);
    }

    static one() {
        return new Vector3(1, 1, 1);
    }

    static half() {
        return new Vector3(0.5, 0.5, 0.5);
    }

    static unitRand() {
        let theta = Math.random() * Math.PI * 2;
        let phi = Math.random() * Math.PI * 2;

        return new Vector3(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi));
    }

    static rotate(theta, phi) {
        return new Vector3(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi));
    }

    static up() {
        return new Vector3(0, 1, 0);
    }

    static down() {
        return new Vector3(0, -1, 0);
    }

    static left() {
        return new Vector3(-1, 0, 0);
    }

    static right() {
        return new Vector3(1, 0, 0);
    }

    static forward() {
        return new Vector3(0, 0, 1);
    }

    static backward() {
        return new Vector3(0, 0, -1);
    }

    static from(sourceArr) {
        return new Vector3(sourceArr[0], sourceArr[1], sourceArr[2]);
    }

    toString() {
        return this.x + ", " + this.y + ", " + this.z;
    }

    valueOf() {
        return this.magnitude();
    }

    array() {
        return [this.x, this.y, this.z];
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    set(v2) {
        this.x = v2.x;
        this.y = v2.y;
        this.z = v2.z;
    }

    zero() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }

    // basic operations that reassign values

    add(v2) {
        this.x += v2.x;
        this.y += v2.y;
        this.z += v2.z;
    }

    subtract(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
        this.z -= v2.z;
    }

    multiply(v2) {
        this.x *= v2.x;
        this.y *= v2.y;
        this.z *= v2.z;
    }

    divide(v2) {
        this.x /= v2.x;
        this.y /= v2.y;
        this.z /= v2.z;
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    normalise() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return;
        } else {
            this.x /= magnitude;
            this.y /= magnitude;
            this.z /= magnitude;
        }
    }

    // basic operations the maintain values and return a new vector

    sum(v2) {
        return new Vector3(this.x + v2.x, this.y + v2.y, this.z + v2.z);
    }

    sum1(x, y, z) {
        return new Vector3(this.x + x, this.y + y, this.z + z);
    }

    difference(v2) {
        return new Vector3(this.x - v2.x, this.y - v2.y, this.z - v2.z);
    }

    product(v2) {
        return new Vector3(this.x * v2.x, this.y * v2.y, this.z * v2.z);
    }

    quotient(v2) {
        return new Vector3(this.x / v2.x, this.y / v2.y, this.z / v2.z);
    }

    distance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;
        let zDiff = this.z - v2.z;

        return Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff);
    }

    squaredDistance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;
        let zDiff = this.z - v2.z;

        return xDiff * xDiff + yDiff * yDiff + zDiff * zDiff;
    }

    scaled(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    normalised() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return new Vector3(0, 0, 0);
        } else {
            return new Vector3(this.x / magnitude, this.y / magnitude, this.z / magnitude);
        }
    }

    // other general operations

    average(v2) {
        return new Vector3((this.x + v2.x) / 2, (this.y + v2.y) / 2, (this.z + v2.z) / 2);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    dotProd(v2) {
        return this.x * v2.x + this.y * v2.y + this.z * v2.z;
    }

    dotProdSelf() {
        let x = this.x;
        let y = this.y;
        let z = this.z;

        return x * x + y * y + z * z;
    }

    crossProd(v2) {
        let x = (this.y * v2.z) - (this.z * v2.y);
        let y = (this.z * v2.x) - (this.x * v2.z);
        let z = (this.x * v2.y) - (this.y * v2.x);

        return new Vector3(x, y, z);
    }

    capNum(num) {
        if (this.x > num) {
            this.x = num;
        } else if (this.x < -num) {
            this.x = -num;
        }

        if (this.y > num) {
            this.y = num;
        } else if (this.y < -num) {
            this.y = -num;
        }

        if (this.z > num) {
            this.z = num;
        } else if (this.z < -num) {
            this.z = -num;
        }
    }

    min(num) {
        if (this.x < num) {
            this.x = num;
        }
        if (this.y < num) {
            this.y = num;
        }
        if (this.z < num) {
            this.z = num;
        }
    }

    max(num) {
        if (this.x > num) {
            this.x = num;
        }
        if (this.y > num) {
            this.y = num;
        }
        if (this.z > num) {
            this.z = num;
        }
    }

    equals(v2, tolerance) {
        if (tolerance) {
            if (Math.abs(this.x - v2.x) < tolerance && Math.abs(this.y - v2.y) < tolerance && Math.abs(this.z - v2.z) < tolerance) {
                return true;
            }
        } else {
            if (this.x == v2.x && this.y == v2.y && this.z == v2.z) {
                return true;
            }
        }

        return false
    }

    lerp(v2, weight) {
        return this.sum(new Vector3(v2.x - this.x, v2.y - this.y, v2.z - this.z).scaled(weight));
    }

    scaleZ(near, origin = Vector3.neutral()) {
        let toOrigin = origin.difference(this);

        let z = -toOrigin.z;

        let x = (near * toOrigin.x) / z;
        let y = (near * toOrigin.y) / z;
        
        return new Vector3(x, y, z);
    }

    unscaleZ(near, origin = Vector3.neutral()) {
        let z = this.z;

        let x = (this.x * z) / near;
        let y = (this.y * z) / near;
        
        return origin.difference(new Vector3(x, y, -z));
    }

    rotateDeg(degs, origin = Vector3.neutral()) {
        let rads = degs.scaled(Math.PI / 180);

        return this.rotateRad(rads, origin);
    }

    rotateRad(rads, origin = Vector3.neutral()) {
        let v1 = this.difference(origin)

        let cx = Math.cos(rads.x);
        let sx = Math.sin(rads.x);
        let cy = Math.cos(rads.y);
        let sy = Math.sin(rads.y);
        let cz = Math.cos(rads.z);
        let sz = Math.sin(rads.z);

        let zx = v1.x * cz - v1.y * sz;
        let zy = v1.y * cz + v1.x * sz;

        let yx = zx * cy - v1.z * sy;
        let yz = v1.z * cy + zx * sy;

        let xy = zy * cx - yz * sx;
        let xz = yz * cx + zy * sx;

        v1.x = yx;
        v1.y = xy;
        v1.z = xz;

        return v1.sum(origin);
    }

    unrotateRad(rads, origin = Vector3.neutral()) {
        let v1 = this.difference(origin)

        let cx = Math.cos(-rads.x);
        let sx = Math.sin(-rads.x);
        let cy = Math.cos(-rads.y);
        let sy = Math.sin(-rads.y);
        let cz = Math.cos(-rads.z);
        let sz = Math.sin(-rads.z);

        let xy = v1.y * cx - v1.z * sx;
        let xz = v1.z * cx + v1.y * sx;

        let yx = v1.x * cy - xz * sy;
        let yz = xz * cy + v1.x * sy;

        let zx = yx * cz - xy * sz;
        let zy = xy * cz + yx * sz;

        v1.x = zx;
        v1.y = zy;
        v1.z = yz;

        return v1.sum(origin);
    }

    rounded() {
        return new Vector3(Math.round(this.x), Math.round(this.y), Math.round(this.z));
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
    }

    floored() {
        return new Vector3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
    }

    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
    }

    mod(num) {
        return new Vector3(this.x % num, this.y % num, this.z % num);
    }

    abs() {
        return new Vector3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }

    greaterThan(v2) {
        return (this.x > v2.x && this.y > v2.y && this.z > v2.z);
    }

    greaterThanEq(v2) {
        return (this.x >= v2.x && this.y >= v2.y && this.z >= v2.z);
    }

    lessThan(v2) {
        return (this.x < v2.x && this.y < v2.y && this.z < v2.z);
    }

    lessThanEq(v2) {
        return (this.x <= v2.x && this.y <= v2.y && this.z <= v2.z);
    }

    toVector2() {
        return new Vector2(this.x, this.y);
    }

    toVector3() {
        return this.clone();
    }

    toVector4() {
        return new Vector4(this.x, this.y, this.z, 1);
    }

    vectorX() {
        return new Vector3(this.x, 0, 0);
    }

    vectorY() {
        return new Vector3(0, this.y, 0);
    }

    vectorZ() {
        return new Vector3(0, 0, this.z);
    }

    toRowMatrix() {
        let newMatrix = Matrix.from(1, 3, [[this.x, this.y, this.z]]);

        return newMatrix;
    }

    toColumnMatrix() {
        let newMatrix = Matrix.from(3, 1, [[this.x], [this.y], [this.z]]);

        return newMatrix;
    }
}

class Vector4 {
    constructor(x = 0, y = x, z = y, w = z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static value(value) {
        return new Vector4(value, value, value, value);
    }

    static neutral() {
        return new Vector4(0, 0, 0, 0);
    }

    static one() {
        return new Vector4(1, 1, 1, 1);
    }

    static half() {
        return new Vector4(0.5, 0.5, 0.5, 0.5);
    }

    static up() {
        return new Vector4(0, 1, 0, 0);
    }

    static down() {
        return new Vector4(0, -1, 0, 0);
    }

    static left() {
        return new Vector4(-1, 0, 0, 0);
    }

    static right() {
        return new Vector4(1, 0, 0, 0);
    }

    static from(sourceArr) {
        return new Vector4(sourceArr[0], sourceArr[1], sourceArr[2], sourceArr[3]);
    }

    toString() {
        return this.x + ", " + this.y + ", " + this.z + ", " + this.w;
    }

    valueOf() {
        return this.magnitude();
    }

    array() {
        return [this.x, this.y, this.z, this.w];
    }

    clone() {
        return new Vector4(this.x, this.y, this.z, this.w);
    }

    set(v2) {
        this.x = v2.x;
        this.y = v2.y;
        this.z = v2.z;
        this.w = v2.w;
    }

    zero() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
    }

    // basic operations that reassign values

    add(v2) {
        this.x += v2.x;
        this.y += v2.y;
        this.z += v2.z;
        this.w += v2.w;
    }

    subtract(v2) {
        this.x -= v2.x;
        this.y -= v2.y;
        this.z -= v2.z;
        this.w -= v2.w;
    }

    multiply(v2) {
        this.x *= v2.x;
        this.y *= v2.y;
        this.z *= v2.z;
        this.w *= v2.w;
    }

    divide(v2) {
        this.x /= v2.x;
        this.y /= v2.y;
        this.z /= v2.z;
        this.w /= v2.w;
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        this.w *= scalar;
    }

    normalise() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return;
        } else {
            this.x /= magnitude;
            this.y /= magnitude;
            this.z /= magnitude;
            this.w /= magnitude;
        }
    }

    // basic operations the maintain values and return a new vector

    sum(v2) {
        return new Vector4(this.x + v2.x, this.y + v2.y, this.z + v2.z, this.w + v2.w);
    }

    difference(v2) {
        return new Vector4(this.x - v2.x, this.y - v2.y, this.z - v2.z, this.w - v2.w);
    }

    product(v2) {
        return new Vector4(this.x * v2.x, this.y * v2.y, this.z * v2.z, this.w * v2.w);
    }

    quotient(v2) {
        return new Vector4(this.x / v2.x, this.y / v2.y, this.z / v2.z, this.w / v2.w);
    }

    distance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;
        let zDiff = this.z - v2.z;
        let wDiff = this.w - v2.w;

        return Math.sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff + wDiff * wDiff);
    }

    squaredDistance(v2) {
        let xDiff = this.x - v2.x;
        let yDiff = this.y - v2.y;
        let zDiff = this.z - v2.z;
        let wDiff = this.w - v2.w;

        return xDiff * xDiff + yDiff * yDiff + zDiff * zDiff + wDiff * wDiff;
    }

    scaled(scalar) {
        return new Vector4(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    }

    normalised() {
        let magnitude = this.magnitude();

        if (magnitude == 0) {
            return new Vector4(0, 0, 0, 0);
        } else {
            return new Vector4(this.x / magnitude, this.y / magnitude, this.z / magnitude, this.w / magnitude);
        }
    }

    // other general operations

    average(v2) {
        return new Vector3((this.x + v2.x) / 2, (this.y + v2.y) / 2, (this.z + v2.z) / 2, (this.w + v2.w) / 2);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    dotProd(v2) {
        return this.x * v2.x + this.y * v2.y + this.z * v2.z + this.w * v2.w;
    }

    dotProdSelf() {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        let w = this.w;

        return x * x + y * y + z * z + w * w;
    }

    capNum(num) {
        if (this.x > num) {
            this.x = num;
        } else if (this.x < -num) {
            this.x = -num;
        }

        if (this.y > num) {
            this.y = num;
        } else if (this.y < -num) {
            this.y = -num;
        }

        if (this.z > num) {
            this.z = num;
        } else if (this.z < -num) {
            this.z = -num;
        }

        if (this.w > num) {
            this.w = num;
        } else if (this.w < -num) {
            this.w = -num;
        }
    }

    min(num) {
        if (this.x < num) {
            this.x = num;
        }
        if (this.y < num) {
            this.y = num;
        }
        if (this.z < num) {
            this.z = num;
        }
        if (this.w < num) {
            this.w = num;
        }
    }

    max(num) {
        if (this.x > num) {
            this.x = num;
        }
        if (this.y > num) {
            this.y = num;
        }
        if (this.z > num) {
            this.z = num;
        }
        if (this.w > num) {
            this.w = num;
        }
    }

    lerp(v2, weight) {
        return this.sum(new Vector4(v2.x - this.x, v2.y - this.y, v2.z - this.z, v2.w - this.w).scaled(weight));
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        this.w = Math.round(this.w);
    }

    rounded() {
        return new Vector4(Math.round(this.x), Math.round(this.y), Math.round(this.z), Math.round(this.w));
    }

    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        this.w = Math.floor(this.w);
    }

    floored() {
        return new Vector4(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z), Math.floor(this.w));
    }

    fastFloor() {
        this.x = ~~this.x;
        this.y = ~~this.y;
        this.z = ~~this.z;
        this.w = ~~this.w;
    }

    fastFloored() {
        return new Vector4(~~this.x, ~~this.y, ~~this.z, ~~this.w);
    }

    mod(num) {
        return new Vector4(this.x % num, this.y % num, this.z % num, this.w % num);
    }

    abs() {
        return new Vector4(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z), Math.abs(this.w));
    }

    toRowMatrix() {
        let newMatrix = Matrix.from(1, 4, [[this.x, this.y, this.z, this.w]]);
        
        return newMatrix;
    }

    toColumnMatrix() {
        let newMatrix = Matrix.from(4, 1, [[this.x], [this.y], [this.z], [this.w]]);

        return newMatrix;
    }

    toVector2() {
        return new Vector2(this.x, this.y);
    }

    toVector3() {
        return new Vector3(this.x, this.y, this.z);
    }

    toVector4() {
        return this.clone();
    }

    vectorX() {
        return new Vector4(this.x, 0, 0, 0);
    }

    vectorY() {
        return new Vector4(0, this.y, 0, 0);
    }

    vectorZ() {
        return new Vector4(0, 0, this.z, 0);
    }

    vectorW() {
        return new Vector4(0, 0, 0, this.w);
    }

    toRGBA() {
        return new RGBA(this.x, this.y, this.z, this.w);
    }
}

class Noise {
    constructor(seed) {
        seed = String(seed);

        let seedSum = 0;

        for (let x = 0; x < seed.length; x++) {
            seedSum += seed.charCodeAt(x);
        }

        this.seed = seedSum;

        let permTableSize = 1024;
        
        let grad = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]].map((a) => Vector3.unitRand().array());
        let p = [207, 938, 803, 318, 19, 860, 572, 788, 221, 140, 219, 1011, 893, 76, 326, 823, 118, 441, 455, 523, 284, 29, 218, 717, 290, 599, 241, 968, 520, 364, 676, 546, 350, 460, 335, 583, 197, 785, 173, 478, 778, 362, 477, 855, 565, 67, 593, 456, 195, 816, 745, 534, 47, 69, 451, 10, 783, 995, 807, 874, 827, 576, 54, 271, 296, 633, 687, 85, 1005, 60, 772, 225, 881, 492, 249, 11, 824, 756, 975, 204, 792, 904, 172, 238, 235, 883, 163, 120, 820, 562, 188, 202, 276, 119, 84, 57, 277, 43, 866, 418, 356, 174, 321, 898, 697, 337, 766, 393, 349, 315, 943, 996, 793, 514, 751, 636, 956, 1019, 992, 420, 510, 611, 953, 566, 260, 835, 838, 568, 436, 729, 35, 51, 659, 890, 651, 849, 376, 338, 105, 691, 942, 110, 936, 283, 919, 515, 444, 804, 532, 99, 799, 267, 596, 181, 630, 822, 136, 483, 231, 344, 760, 1001, 535, 125, 299, 182, 66, 143, 198, 214, 900, 921, 701, 100, 484, 579, 266, 48, 524, 930, 674, 454, 495, 845, 791, 216, 863, 563, 649, 536, 466, 619, 23, 1002, 130, 809, 519, 764, 439, 223, 922, 1012, 522, 1015, 814, 408, 787, 733, 461, 607, 511, 564, 300, 360, 923, 935, 817, 365, 36, 73, 552, 854, 983, 485, 90, 322, 193, 343, 907, 789, 689, 929, 531, 1003, 932, 403, 658, 648, 709, 206, 359, 645, 469, 352, 802, 413, 644, 228, 740, 390, 775, 210, 158, 727, 92, 106, 829, 547, 83, 828, 127, 848, 627, 948, 719, 398, 38, 482, 257, 432, 587, 324, 168, 298, 657, 967, 896, 329, 270, 856, 677, 150, 423, 117, 250, 471, 13, 336, 978, 749, 600, 683, 693, 553, 440, 108, 990, 870, 272, 357, 199, 582, 366, 797, 287, 716, 892, 586, 406, 819, 833, 590, 372, 18, 75, 1017, 1018, 385, 91, 5, 310, 631, 516, 374, 212, 504, 229, 682, 463, 965, 102, 741, 407, 984, 584, 388, 518, 813, 142, 104, 612, 949, 320, 263, 867, 52, 639, 871, 265, 89, 341, 203, 726, 26, 264, 0, 805, 45, 662, 557, 696, 746, 309, 832, 186, 171, 795, 128, 912, 985, 139, 465, 494, 872, 405, 430, 962, 378, 681, 409, 330, 950, 227, 928, 843, 383, 969, 637, 581, 254, 480, 847, 428, 146, 39, 1022, 462, 945, 319, 895, 873, 384, 415, 706, 97, 49, 542, 537, 643, 986, 44, 902, 40, 411, 781, 62, 129, 530, 58, 868, 1021, 508, 993, 71, 678, 46, 196, 400, 698, 56, 540, 917, 551, 239, 96, 194, 526, 635, 774, 897, 467, 1009, 937, 971, 304, 624, 126, 684, 387, 380, 569, 137, 391, 887, 151, 226, 15, 550, 705, 641, 735, 667, 622, 213, 629, 875, 316, 580, 220, 952, 156, 699, 961, 30, 50, 165, 541, 798, 1020, 734, 567, 443, 240, 41, 742, 603, 621, 660, 446, 933, 732, 275, 771, 497, 42, 889, 155, 715, 588, 642, 258, 529, 395, 533, 414, 255, 114, 268, 597, 1007, 179, 32, 16, 613, 837, 386, 543, 982, 124, 591, 476, 317, 779, 346, 176, 976, 725, 489, 205, 616, 184, 162, 169, 589, 331, 944, 970, 294, 575, 509, 507, 501, 947, 831, 617, 243, 503, 905, 888, 491, 170, 675, 410, 224, 647, 358, 714, 379, 232, 538, 20, 692, 609, 65, 17, 292, 762, 286, 744, 157, 502, 918, 869, 512, 493, 963, 288, 578, 340, 672, 748, 178, 668, 1023, 242, 570, 506, 37, 311, 323, 796, 328, 200, 913, 442, 251, 166, 282, 654, 187, 412, 614, 712, 763, 144, 132, 966, 177, 369, 422, 93, 208, 111, 750, 850, 628, 830, 973, 280, 458, 4, 625, 498, 28, 940, 555, 70, 61, 68, 548, 452, 88, 839, 879, 730, 544, 334, 686, 661, 306, 753, 475, 279, 777, 27, 486, 704, 1008, 695, 758, 8, 191, 401, 342, 121, 481, 500, 397, 592, 800, 453, 556, 160, 59, 979, 152, 901, 840, 601, 392, 634, 281, 851, 939, 794, 417, 164, 363, 549, 488, 6, 431, 738, 3, 107, 977, 135, 399, 499, 558, 769, 302, 877, 853, 559, 9, 812, 307, 655, 312, 931, 561, 852, 308, 348, 713, 790, 571, 473, 806, 237, 1006, 585, 927, 747, 720, 345, 885, 859, 914, 236, 999, 899, 22, 673, 14, 269, 449, 81, 447, 404, 256, 347, 882, 954, 246, 377, 95, 368, 185, 274, 577, 189, 759, 201, 248, 638, 78, 707, 757, 63, 123, 815, 666, 924, 389, 618, 247, 234, 80, 915, 836, 527, 605, 427, 721, 903, 664, 112, 33, 285, 925, 72, 857, 435, 955, 620, 834, 964, 876, 450, 736, 615, 690, 159, 594, 780, 470, 606, 445, 244, 573, 154, 825, 333, 891, 960, 623, 994, 958, 632, 314, 842, 86, 878, 910, 468, 554, 669, 355, 671, 685, 464, 278, 864, 305, 610, 708, 416, 479, 373, 183, 301, 1000, 598, 94, 64, 222, 858, 325, 731, 754, 980, 786, 74, 602, 131, 87, 1016, 153, 167, 773, 433, 528, 934, 539, 703, 521, 295, 626, 457, 595, 293, 303, 981, 525, 339, 909, 1004, 767, 180, 367, 429, 865, 718, 190, 710, 12, 861, 737, 273, 381, 768, 109, 34, 116, 724, 353, 394, 496, 253, 906, 846, 382, 291, 991, 327, 862, 723, 711, 665, 608, 743, 653, 354, 656, 987, 419, 149, 989, 670, 818, 134, 371, 988, 810, 811, 425, 98, 801, 761, 808, 700, 694, 920, 375, 472, 351, 880, 424, 517, 770, 148, 957, 490, 53, 487, 426, 361, 297, 728, 886, 147, 663, 459, 133, 141, 916, 332, 7, 215, 402, 145, 31, 560, 688, 211, 55, 640, 782, 289, 784, 679, 161, 776, 702, 545, 233, 230, 122, 680, 25, 24, 434, 262, 908, 844, 437, 209, 1, 911, 604, 997, 826, 765, 652, 370, 438, 1013, 752, 722, 974, 261, 77, 421, 21, 396, 313, 474, 998, 739, 245, 884, 959, 951, 252, 926, 513, 972, 113, 574, 138, 841, 505, 101, 646, 755, 1010, 82, 946, 103, 217, 941, 115, 821, 1014, 894, 650, 259, 448, 2, 79, 192, 175];

        let perm = new Array(permTableSize * 2);
        let gradP = new Array(permTableSize * 2);

        for(let i = 0; i < permTableSize; i++) {
            let v;
            if (i & 1) {
                v = p[i] ^ (seedSum % permTableSize);
            } else {
                v = p[i] ^ (this.random(v) % permTableSize);
            }

            perm[i] = perm[i + permTableSize] = v;
            gradP[i] = gradP[i + permTableSize] = grad[v % 12];
        }

        this.perm = perm;
        this.gradP = gradP;
        this.permTableSize = permTableSize;

        this.randLookup = {};

        this.settings(1, 1, 1, 1, 1, 1, 1);
    }

    settings(frequency, roughness, amplitude, persistence, cellSize, octaves, contrast) {
        this.frequency = frequency;
        this.roughness = roughness;
        this.amplitude = amplitude;
        this.persistence = persistence;
        this.cellSize = cellSize;
        this.octaves = octaves;
        this.contrast = contrast;

        let frequencies = [];
        let amplitudes = [];

        for (let i = 0; i < octaves; i++) {
            frequencies[i] = frequency * Math.pow(roughness, i);
            amplitudes[i] = amplitude * Math.pow(persistence, i);
        }

        this.amplitudes = amplitudes;
        this.frequencies = frequencies;
    }

    random(seed) {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;

        h1 = h2 ^ (h1 ^ seed * 597399067);
        h2 = h3 ^ (h2 ^ seed * 2869860233);
        h3 = h4 ^ (h3 ^ seed * 951274213);
        h4 = h1 ^ (h4 ^ seed * 2716044179);

        h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
        return Math.abs(h1 / (h2 ^ h3) * h4) % 1;
    }

    randomAngle(seed) {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;

        h1 = h2 ^ (h1 ^ seed * 597399067);
        h2 = h3 ^ (h2 ^ seed * 2869860233);
        h3 = h4 ^ (h3 ^ seed * 951274213);
        h4 = h1 ^ (h4 ^ seed * 2716044179);

        h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
        return Math.abs(h1 / (h2 ^ h3) * h4) % (Math.PI * 2);
    }

    dot2(v1, x2, y2) {
        return v1[0] * x2 + v1[1] * y2;
    }

    dot3(v1, x2, y2, z2) {
        return v1[0] * x2 + v1[1] * y2 + v1[2] * z2;
    }

    ease(t) {
        let t3 = 10 * t * t * t;
        let t4 = 1.5 * t3 * t;
        let t5 = 0.4 * t4 * t;

        return t5 - t4 + t3;
    }

    perlin(x0, y0) {
        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;
        let permTableSize = this.permTableSize;

        x0 /= cellSize;
        y0 /= cellSize;

        let frequencies = this.frequencies;
        let amplitudes = this.amplitudes;

        let val = 0;
        let offsetSum = 0;

        for (let i = 0; i < octaves; i++) {
            let frequency1 = frequencies[i];

            let x = x0 * frequency1 + offsetSum;
            let y = y0 * frequency1 + offsetSum;

            x = permTableSize - (Math.abs(x) < permTableSize ? x : x % permTableSize);
            y = permTableSize - (Math.abs(y) < permTableSize ? y : y % permTableSize);
    
            let x1 = ~~x;
            let y1 = ~~y;

            let x2 = x1 + 1;
            let y2 = y1 + 1;
    
            let x3 = x - x1;
            let y3 = y - y1;
            let x4 = x3 - 1;
            let y4 = y3 - 1;

            let g0 = gradP[perm[x1 + perm[y1]]]; 
            let g1 = gradP[perm[x2 + perm[y1]]];
            let g2 = gradP[perm[x1 + perm[y2]]];
            let g3 = gradP[perm[x2 + perm[y2]]];
    
            let dotProd1 = g0[0] * x3 + g0[1] * y3;
            let dotProd2 = g1[0] * x4 + g1[1] * y3;
            let dotProd3 = g2[0] * x3 + g2[1] * y4;
            let dotProd4 = g3[0] * x4 + g3[1] * y4;

            x3 = this.ease(x3);
            y3 = this.ease(y3);

            let x3_1 = 1 - x3;
            let y3_1 = 1 - y3;
            
            val += (y3_1 * (x3_1 * dotProd1 + x3 * dotProd2) + y3 * (x3_1 * dotProd3 + x3 * dotProd4)) * amplitudes[i];

            offsetSum += 0.72;
        }

        return val * contrast;
    }

    perlin3(x0, y0, z0) {
        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;
        let permTableSize = this.permTableSize;

        x0 /= cellSize;
        y0 /= cellSize;
        z0 /= cellSize;

        let frequencies = this.frequencies;
        let amplitudes = this.amplitudes;

        let val = 0;
        let offsetSum = 0;

        for (let i = 0; i < octaves; i++) {
            let frequency1 = frequencies[i];

            let x = x0 * frequency1 + offsetSum;
            let y = y0 * frequency1 + offsetSum;
            let z = z0 * frequency1 + offsetSum;

            x = permTableSize - (Math.abs(x) < permTableSize ? x : x % permTableSize);
            y = permTableSize - (Math.abs(y) < permTableSize ? y : y % permTableSize);
            z = permTableSize - (Math.abs(z) < permTableSize ? z : z % permTableSize);
    
            let x1 = ~~x;
            let y1 = ~~y;
            let z1 = ~~z;

            let x2 = x1 + 1;
            let y2 = y1 + 1;
            let z2 = z1 + 1;
    
            let x3 = x - x1;
            let y3 = y - y1;
            let z3 = z - z1;
            let x4 = x3 - 1;
            let y4 = y3 - 1;
            let z4 = z3 - 1;
    
            let dotProd1 = this.dot3(gradP[perm[x1 + perm[y1 + perm[z1]]]], x3, y3, z3);
            let dotProd2 = this.dot3(gradP[perm[x2 + perm[y1 + perm[z1]]]], x4, y3, z3);
            let dotProd3 = this.dot3(gradP[perm[x1 + perm[y2 + perm[z1]]]], x3, y4, z3);
            let dotProd4 = this.dot3(gradP[perm[x2 + perm[y2 + perm[z1]]]], x4, y4, z3);
    
            let dotProd5 = this.dot3(gradP[perm[x1 + perm[y1 + perm[z2]]]], x3, y3, z4);
            let dotProd6 = this.dot3(gradP[perm[x2 + perm[y1 + perm[z2]]]], x4, y3, z4);
            let dotProd7 = this.dot3(gradP[perm[x1 + perm[y2 + perm[z2]]]], x3, y4, z4);
            let dotProd8 = this.dot3(gradP[perm[x2 + perm[y2 + perm[z2]]]], x4, y4, z4);

            x3 = this.ease(x3)
            y3 = this.ease(y3)
            z3 = this.ease(z3)

            let x3_1 = 1 - x3;
            let y3_1 = 1 - y3;
            let z3_1 = 1 - z3;
            
            val += (z3_1 * (y3_1 * (x3_1 * dotProd1 + x3 * dotProd2) + y3 * (x3_1 * dotProd3 + x3 * dotProd4)) + z3 * (y3_1 * (x3_1 * dotProd5 + x3 * dotProd6) + y3 * (x3_1 * dotProd7 + x3 * dotProd8))) * amplitudes[i];

            offsetSum += 0.72;
        }

        return val * contrast;
    }

    perlinBuffer(width, height, offsetX = 0, offsetY = 0) {
        let buffer = new Float32Array(width * height);

        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;
        let permTableSize = this.permTableSize;

        let ease = this.ease;

        let frequencies = this.frequencies;
        let amplitudes = this.amplitudes;

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let x0 = (i + offsetX) / cellSize;
                let y0 = (j + offsetY) / cellSize;

                let index = i + j * width;

                let val = 0;
                let offsetSum = 0;

                for (let k = 0; k < octaves; k++) {
                    let frequency1 = frequencies[k];

                    let x = x0 * frequency1 + offsetSum;
                    let y = y0 * frequency1 + offsetSum;

                    x = permTableSize - (Math.abs(x) < permTableSize ? x : x % permTableSize);
                    y = permTableSize - (Math.abs(y) < permTableSize ? y : y % permTableSize);
            
                    let x1 = ~~x;
                    let y1 = ~~y;

                    let x2 = x1 + 1;
                    let y2 = y1 + 1;
            
                    let x3 = x - x1;
                    let y3 = y - y1;
                    let x4 = x3 - 1;
                    let y4 = y3 - 1;

                    let g0 = gradP[perm[x1 + perm[y1]]]; 
                    let g1 = gradP[perm[x2 + perm[y1]]];
                    let g2 = gradP[perm[x1 + perm[y2]]];
                    let g3 = gradP[perm[x2 + perm[y2]]];
            
                    let dotProd1 = g0[0] * x3 + g0[1] * y3;
                    let dotProd2 = g1[0] * x4 + g1[1] * y3;
                    let dotProd3 = g2[0] * x3 + g2[1] * y4;
                    let dotProd4 = g3[0] * x4 + g3[1] * y4;

                    x3 = ease(x3);
                    y3 = ease(y3);

                    let x3_1 = 1 - x3;
                    let y3_1 = 1 - y3;
                    
                    val += (y3_1 * (x3_1 * dotProd1 + x3 * dotProd2) + y3 * (x3_1 * dotProd3 + x3 * dotProd4)) * amplitudes[k];

                    offsetSum += 0.72;
                }

                buffer[index] = val * contrast;
            }
        }

        return buffer;
    }

    perlinBuffer3(width, height, z0, offsetX = 0, offsetY = 0) {
        let buffer = new Float32Array(width * height);

        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;
        let permTableSize = this.permTableSize;

        let dot3 = this.dot3;
        let ease = this.ease;

        z0 /= cellSize;

        let frequencies = this.frequencies;
        let amplitudes = this.amplitudes;

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let x0 = (i + offsetX) / cellSize;
                let y0 = (j + offsetY) / cellSize;

                let index = i + j * width;

                let val = 0;
                let offsetSum = 0;

                for (let k = 0; k < octaves; k++) {
                    let frequency1 = frequencies[k];

                    let x = x0 * frequency1 + offsetSum;
                    let y = y0 * frequency1 + offsetSum;
                    let z = z0 * frequency1 + offsetSum;

                    x = permTableSize - (Math.abs(x) < permTableSize ? x : x % permTableSize);
                    y = permTableSize - (Math.abs(y) < permTableSize ? y : y % permTableSize);
                    z = permTableSize - (Math.abs(z) < permTableSize ? z : z % permTableSize);
            
                    let x1 = ~~x;
                    let y1 = ~~y;
                    let z1 = ~~z;

                    let x2 = x1 + 1;
                    let y2 = y1 + 1;
                    let z2 = z1 + 1;
            
                    let x3 = x - x1;
                    let y3 = y - y1;
                    let z3 = z - z1;
                    let x4 = x3 - 1;
                    let y4 = y3 - 1;
                    let z4 = z3 - 1;
            
                    let dotProd1 = dot3(gradP[perm[x1 + perm[y1 + perm[z1]]]], x3, y3, z3);
                    let dotProd2 = dot3(gradP[perm[x2 + perm[y1 + perm[z1]]]], x4, y3, z3);
                    let dotProd3 = dot3(gradP[perm[x1 + perm[y2 + perm[z1]]]], x3, y4, z3);
                    let dotProd4 = dot3(gradP[perm[x2 + perm[y2 + perm[z1]]]], x4, y4, z3);
            
                    let dotProd5 = dot3(gradP[perm[x1 + perm[y1 + perm[z2]]]], x3, y3, z4);
                    let dotProd6 = dot3(gradP[perm[x2 + perm[y1 + perm[z2]]]], x4, y3, z4);
                    let dotProd7 = dot3(gradP[perm[x1 + perm[y2 + perm[z2]]]], x3, y4, z4);
                    let dotProd8 = dot3(gradP[perm[x2 + perm[y2 + perm[z2]]]], x4, y4, z4);

                    x3 = ease(x3)
                    y3 = ease(y3)
                    z3 = ease(z3)

                    let x3_1 = 1 - x3;
                    let y3_1 = 1 - y3;
                    let z3_1 = 1 - z3;
                    
                    val += (z3_1 * (y3_1 * (x3_1 * dotProd1 + x3 * dotProd2) + y3 * (x3_1 * dotProd3 + x3 * dotProd4)) + z3 * (y3_1 * (x3_1 * dotProd5 + x3 * dotProd6) + y3 * (x3_1 * dotProd7 + x3 * dotProd8))) * amplitudes[k];

                    offsetSum += 0.72;
                }

                buffer[index] = val * contrast;
            }
        }

        return buffer;
    }

    simplex(x, y) {
        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;
        let permTableSize = this.permTableSize;
        let permTableSizeMin1 = permTableSize - 1;

        x /= cellSize;
        y /= cellSize;

        let frequencies = this.frequencies;
        let amplitudes = this.amplitudes;

        let F = 0.5 * (Math.sqrt(3) - 1);
        let G = (3 - Math.sqrt(3)) / 6;
        let G2 = G * 2 - 1;

        let val = 0;
        let offsetSum = 0;

        for (let i = 0; i < octaves; i++) {
            let frequency1 = frequencies[i];

            let xin = Math.abs(x * frequency1 + offsetSum);
            let yin = Math.abs(y * frequency1 + offsetSum);

            xin = xin < permTableSize ? xin : xin % permTableSize;
            yin = yin < permTableSize ? yin : yin % permTableSize;

            let n = 0;

            let s = (xin + yin) * F;

            let u = ~~(xin + s);
            let v = ~~(yin + s);

            let t = (u + v) * G;
            let x0 = xin - u + t;
            let y0 = yin - v + t;

            let u1 = 0;
            let v1 = 0;

            if (x0 > y0) {
                u1 = 1;
            } else {
                v1 = 1;
            }

            let x1 = x0 - u1 + G;
            let y1 = y0 - v1 + G;
            let x2 = x0 + G2;
            let y2 = y0 + G2;

            u = u < permTableSizeMin1 ? u : u & permTableSizeMin1;
            v = v < permTableSizeMin1 ? v : v & permTableSizeMin1;

            let t0 = 0.5 - x0 * x0 - y0 * y0;
            if (t0 >= 0) {
                let g0 = gradP[perm[u + perm[v]]];

                t0 *= t0;
                n += t0 * t0 * (g0[0] * x0 + g0[1] * y0);
            }

            let t1 = 0.5 - x1 * x1 - y1 * y1;
            if (t1 >= 0) {
                let g1 = gradP[perm[u + u1 + perm[v + v1]]];

                t1 *= t1;
                n += t1 * t1 * (g1[0] * x1 + g1[1] * y1);
            }

            let t2 = 0.5 - x2 * x2 - y2 * y2;
            if (t2 >= 0) {
                let g2 = gradP[perm[u + 1 + perm[v + 1]]];

                t2 *= t2;
                n += t2 * t2 * (g2[0] * x2 + g2[1] * y2);
            }

            val += n * amplitudes[i];

            offsetSum += 0.72;
        }

        return val * 70 * contrast;
    }

    simplex3(x, y, z) {
        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;
        let permTableSize = this.permTableSize;
        let permTableSizeMin1 = permTableSize - 1;

        x /= cellSize;
        y /= cellSize;
        z /= cellSize;

        let frequencies = this.frequencies;
        let amplitudes = this.amplitudes;

        let F = 1 / 3;
        let G = 1 / 6;
        let G2 = G * 2;
        let G3 = G * 3 - 1;

        let val = 0;
        let offsetSum = 0;

        for (let i = 0; i < octaves; i++) {
            let frequency1 = frequencies[i];

            let xin = Math.abs(x * frequency1 + offsetSum);
            let yin = Math.abs(y * frequency1 + offsetSum);
            let zin = Math.abs(z * frequency1 + offsetSum);

            xin = xin < permTableSize ? xin : xin % permTableSize;
            yin = yin < permTableSize ? yin : yin % permTableSize;
            zin = zin < permTableSize ? zin : zin % permTableSize;

            let n = 0;

            let s = (xin + yin + zin) * F;

            let u = ~~(xin + s);
            let v = ~~(yin + s);
            let w = ~~(zin + s);

            let t = (u + v + w) * G;
            let x0 = xin - u + t;
            let y0 = yin - v + t;
            let z0 = zin - w + t;

            let u1 = 0;
            let v1 = 0;
            let w1 = 0;
            let u2 = 0;
            let v2 = 0;
            let w2 = 0;

            if (x0 >= y0) {
                if (y0 >= z0) { 
                    u1 = 1;
                    u2 = 1; 
                    v2 = 1;
                } else if (x0 >= z0) { 
                    u1 = 1;
                    u2 = 1; 
                    w2 = 1; 
                } else { 
                    w1 = 1; 
                    u2 = 1; 
                    w2 = 1; 
                }
            } else {
                if (y0 < z0) { 
                    w1 = 1; 
                    v2 = 1; 
                    w2 = 1; 
                } else if (x0 < z0) { 
                    v1 = 1;
                    v2 = 1; 
                    w2 = 1; 
                } else { 
                    v1 = 1; 
                    u2 = 1; 
                    v2 = 1;
                }
            }

            let x1 = x0 - u1 + G;
            let y1 = y0 - v1 + G;
            let z1 = z0 - w1 + G;
            let x2 = x0 - u2 + G2;
            let y2 = y0 - v2 + G2;
            let z2 = z0 - w2 + G2;
            let x3 = x0 + G3;
            let y3 = y0 + G3;
            let z3 = z0 + G3;

            u = u < permTableSizeMin1 ? u : u & permTableSizeMin1;
            v = v < permTableSizeMin1 ? v : v & permTableSizeMin1;
            w = w < permTableSizeMin1 ? w : w & permTableSizeMin1;

            let t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
            if (t0 >= 0) {
                let g0 = gradP[perm[u + perm[v + perm[w]]]];

                t0 *= t0;
                n += t0 * t0 * (g0[0] * x0 + g0[1] * y0 + g0[2] * z0);
            }

            let t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
            if (t1 >= 0) {
                let g1 = gradP[perm[u + u1 + perm[v + v1 + perm[w + w1]]]];

                t1 *= t1;
                n += t1 * t1 * (g1[0] * x1 + g1[1] * y1 + g1[2] * z1);
            }

            let t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
            if (t2 >= 0) {
                let g2 = gradP[perm[u + u2 + perm[v + v2 + perm[w + w2]]]];

                t2 *= t2;
                n += t2 * t2 * (g2[0] * x2 + g2[1] * y2 + g2[2] * z2);
            }

            let t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
            if (t3 >= 0) {
                let g3 = gradP[perm[u + 1 + perm[v + 1 + perm[w + 1]]]];

                t3 *= t3;
                n += t3 * t3 * (g3[0] * x3 + g3[1] * y3 + g3[2] * z3);
            }

            val += n * amplitudes[i];

            offsetSum += 0.72;
        }

        return val * 32 * contrast;
    }

    simplexBuffer(width, height, offsetX = 0, offsetY = 0) {
        let buffer = new Float32Array(width * height);

        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;
        let permTableSize = this.permTableSize;
        let permTableSizeMin1 = permTableSize - 1;

        let dot2 = this.dot2;

        let frequencies = this.frequencies;
        let amplitudes = this.amplitudes;

        let F = 0.5 * (Math.sqrt(3) - 1);
        let G = (3 - Math.sqrt(3)) / 6;
        let G2 = G * 2 - 1;

        contrast *= 70;

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let x = (i + offsetX) / cellSize;
                let y = (j + offsetY) / cellSize;

                let index = i + j * width;

                let val = 0;
                let offsetSum = 0;

                for (let k = 0; k < octaves; k++) {
                    let frequency1 = frequencies[k];
                    let amplitude1 = amplitudes[k];

                    let xin = Math.abs(x * frequency1 + offsetSum);;
                    let yin = Math.abs(y * frequency1 + offsetSum);;

                    xin = xin < permTableSize ? xin : xin % permTableSize;
                    yin = yin < permTableSize ? yin : yin % permTableSize;

                    let n = 0;

                    let s = (xin + yin) * F;

                    let u = ~~(xin + s);
                    let v = ~~(yin + s);

                    let t = (u + v) * G;
                    let x0 = xin - u + t;
                    let y0 = yin - v + t;

                    let u1 = 0;
                    let v1 = 0;

                    if (x0 > y0) {
                        u1 = 1;
                    } else {
                        v1 = 1;
                    }

                    let x1 = x0 - u1 + G;
                    let y1 = y0 - v1 + G;
                    let x2 = x0 + G2;
                    let y2 = y0 + G2;

                    u &= permTableSizeMin1;
                    v &= permTableSizeMin1;

                    let t0 = 0.5 - x0 * x0 - y0 * y0;
                    if (t0 >= 0) {
                        let g0 = gradP[perm[u + perm[v]]];

                        t0 *= t0;
                        n += t0 * t0 * (g0[0] * x0 + g0[1] * y0);
                    }

                    let t1 = 0.5 - x1 * x1 - y1 * y1;
                    if (t1 >= 0) {
                        let g1 = gradP[perm[u + u1 + perm[v + v1]]];

                        t1 *= t1;
                        n += t1 * t1 * (g1[0] * x1 + g1[1] * y1);
                    }

                    let t2 = 0.5 - x2 * x2 - y2 * y2;
                    if (t2 >= 0) {
                        let g2 = gradP[perm[u + 1 + perm[v + 1]]];

                        t2 *= t2;
                        n += t2 * t2 * (g2[0] * x2 + g2[1] * y2);
                    }

                    val += n * amplitude1;

                    offsetSum += 0.72;
                }

                buffer[index] = val * contrast;
            }
        }

        return buffer;
    }

    simplexBuffer3(width, height, z, offsetX = 0, offsetY = 0) {
        let buffer = new Float32Array(width * height);

        let octaves = this.octaves;
        let cellSize = this.cellSize;
        let contrast = this.contrast;
            
        let gradP = this.gradP;
        let perm = this.perm;
        let permTableSize = this.permTableSize;
        let permTableSizeMin1 = permTableSize - 1;

        let dot3 = this.dot3;

        z /= cellSize;

        let frequencies = this.frequencies;
        let amplitudes = this.amplitudes;

        let F = 1 / 3;
        let G = 1 / 6;

        let G2 = G * 2;
        let G3 = G * 3 - 1;

        contrast *= 32;

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                let x = (i + offsetX) / cellSize;
                let y = (j + offsetY) / cellSize;

                let index = i + j * width;

                let val = 0;
                let offsetSum = 0;

                for (let k = 0; k < octaves; k++) {
                    let frequency1 = frequencies[k];

                    let xin = Math.abs(x * frequency1 + offsetSum);
                    let yin = Math.abs(y * frequency1 + offsetSum);
                    let zin = Math.abs(z * frequency1 + offsetSum);

                    xin = xin < permTableSize ? xin : xin % permTableSize;
                    yin = yin < permTableSize ? yin : yin % permTableSize;
                    zin = zin < permTableSize ? zin : zin % permTableSize;
        
                    let n = 0;
        
                    let s = (xin + yin + zin) * F;
        
                    let u = ~~(xin + s);
                    let v = ~~(yin + s);
                    let w = ~~(zin + s);
        
                    let t = (u + v + w) * G;
                    let x0 = xin - u + t;
                    let y0 = yin - v + t;
                    let z0 = zin - w + t;
        
                    let u1 = 0;
                    let v1 = 0;
                    let w1 = 0;
                    let u2 = 0;
                    let v2 = 0;
                    let w2 = 0;
        
                    if (x0 >= y0) {
                        if (y0 >= z0) { 
                            u1 = 1;
                            u2 = 1; 
                            v2 = 1;
                        } else if (x0 >= z0) { 
                            u1 = 1;
                            u2 = 1; 
                            w2 = 1; 
                        } else { 
                            w1 = 1; 
                            u2 = 1; 
                            w2 = 1; 
                        }
                    } else {
                        if (y0 < z0) { 
                            w1 = 1; 
                            v2 = 1; 
                            w2 = 1; 
                        } else if (x0 < z0) { 
                            v1 = 1;
                            v2 = 1; 
                            w2 = 1; 
                        } else { 
                            v1 = 1; 
                            u2 = 1; 
                            v2 = 1;
                        }
                    }
        
                    let x1 = x0 - u1 + G;
                    let y1 = y0 - v1 + G;
                    let z1 = z0 - w1 + G;
                    let x2 = x0 - u2 + G2;
                    let y2 = y0 - v2 + G2;
                    let z2 = z0 - w2 + G2;
                    let x3 = x0 + G3;
                    let y3 = y0 + G3;
                    let z3 = z0 + G3;
        
                    u = u < permTableSizeMin1 ? u : u & permTableSizeMin1;
                    v = v < permTableSizeMin1 ? v : v & permTableSizeMin1;
                    w = w < permTableSizeMin1 ? w : w & permTableSizeMin1;
        
                    let t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
                    if (t0 >= 0) {
                        let g0 = gradP[perm[u + perm[v + perm[w]]]];

                        t0 *= t0;
                        n += t0 * t0 * (g0[0] * x0 + g0[1] * y0 + g0[2] * z0);
                    }
        
                    let t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
                    if (t1 >= 0) {
                        let g1 = gradP[perm[u + u1 + perm[v + v1 + perm[w + w1]]]];

                        t1 *= t1;
                        n += t1 * t1 * (g1[0] * x1 + g1[1] * y1 + g1[2] * z1);
                    }
        
                    let t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
                    if (t2 >= 0) {
                        let g2 = gradP[perm[u + u2 + perm[v + v2 + perm[w + w2]]]];

                        t2 *= t2;
                        n += t2 * t2 * (g2[0] * x2 + g2[1] * y2 + g2[2] * z2);
                    }
        
                    let t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
                    if (t3 >= 0) {
                        let g3 = gradP[perm[u + 1 + perm[v + 1 + perm[w + 1]]]];

                        t3 *= t3;
                        n += t3 * t3 * (g3[0] * x3 + g3[1] * y3 + g3[2] * z3);
                    }
        
                    val += n * amplitudes[k];
        
                    offsetSum += 0.72;
                }

                buffer[index] = val * contrast;
            }
        }

        return buffer;
    }
}

class RGBA {
    constructor(r = 0, g = r, b = g, a = g) {
        this.r = ~~r;
        this.g = ~~g;
        this.b = ~~b;
        this.a = ~~a;
    }

    static white() {
        return new RGBA(255, 255, 255, 255);
    }

    static black() {
        return new RGBA(0, 0, 0, 255);
    }

    static opacity(opacity) {
        return new RGBA(255, 255, 255, opacity);
    }

    static brightness(brightness) {
        return new RGBA(brightness, brightness, brightness, 255);
    }

    static value(value) {
        return new RGBA(value, value, value, value);
    }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255})`;
    }
    
    array() {
        return [this.r, this.g, this.b, this.a];
    }

    clone() {
        return new RGBA(this.r, this.g, this.b, this.a);
    }

    toVector4() {
        return new Vector4(this.r, this.g, this.b, this.a);
    }

    add(rgba2) {
        this.r += rgba2.r;
        this.g += rgba2.g;
        this.b += rgba2.b;
        this.a += rgba2.a;
    }

    subtract(rgba2) {
        this.r -= rgba2.r;
        this.g -= rgba2.g;
        this.b -= rgba2.b;
        this.a -= rgba2.a;
    }

    multiply(rgba2) {
        this.r *= rgba2.r;
        this.g *= rgba2.g;
        this.b *= rgba2.b;
        this.a *= rgba2.a;
    }

    divide(rgba2) {
        this.r /= rgba2.r;
        this.g /= rgba2.g;
        this.b /= rgba2.b;
        this.a /= rgba2.a;
    }

    sum(rgba2) {
        return new RGBA(this.r + rgba2.r, this.g + rgba2.g, this.b + rgba2.b, this.a + rgba2.a);
    }

    difference(rgba2) {
        return new RGBA(this.r - rgba2.r, this.g - rgba2.g, this.b - rgba2.b, this.a - rgba2.a);
    }

    product(rgba2) {
        return new RGBA(this.r * rgba2.r, this.g * rgba2.g, this.b * rgba2.b, this.a * rgba2.a);
    }

    quotient(rgba2) {
        return new RGBA(this.r / rgba2.r, this.g / rgba2.g, this.b / rgba2.b, this.a / rgba2.a);
    }

    scale(scalar) {
        this.r *= scalar;
        this.g *= scalar;
        this.b *= scalar;
        this.a *= scalar;
    }

    scaled(scalar) {
        return new RGBA(this.r * scalar, this.g * scalar, this.b * scalar, this.a * scalar);
    }

    mix(rgba2, weight) {
        let r = this.r + (this.r - rgba2.r) * weight;
        let g = this.g + (this.g - rgba2.g) * weight;
        let b = this.b + (this.b - rgba2.b) * weight;
        let a = this.a + (this.a - rgba2.a) * weight;

        return new RGBA(r, g, b, a);
    }
}

class Texture2D {
    constructor(width, height, buffer) {
        this.width = width;
        this.height = height;
        
        this.dimensions = new Vector2(width, height);

        if (typeof buffer[0] == "object") {
            this.setBuffer(buffer);
        } else {
            this.setBufferComponents(buffer);
        }
    }

    setBuffer(buffer) {
        let newBuffer = [];

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                let index = i + j * this.width;

                if (index > buffer.length) {
                    newBuffer[index] = RGBA.white();
                } else {
                    newBuffer[index] = buffer[index];
                }
            }
        }

        this.buffer = newBuffer;
        this.bufferLength = newBuffer.length;
    }

    setBufferComponents(buffer) {
        let newBuffer = [];

        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                let index = (i + j * this.width) * 4;

                if (index > buffer.length) {
                    newBuffer[index] = RGBA.white();
                } else {
                    let r = buffer[index + 0];
                    let g = buffer[index + 1];
                    let b = buffer[index + 2];
                    let a = buffer[index + 3]
                    
                    newBuffer[index / 4] = new RGBA(r, g, b, a);
                }
            }
        }

        this.buffer = newBuffer;
        this.bufferLength = newBuffer.length;
    }

    uv(uv) {
        let coord = uv.product(this.dimensions).fastFloored();

        let index = Math.abs(coord.x + coord.y * this.width) % this.bufferLength;

        if (!index) {
            index = 0;
        }

        return this.buffer[index];
    }

    uvComponents(u, v) {
        u = ~~(u * this.width);
        v = ~~(v * this.height);

        let index = Math.abs(u + v * this.width) % this.bufferLength;

        if (!index) {
            index = 0;
        }

        return this.buffer[index];
    }

    xy(xy) {
        let coord = xy.floored();

        let index = coord.x + coord.y * this.width;


        return this.buffer[index % this.bufferLength] || RGBA.white();
    }
}

class Math2 {
    static TAU = Math.PI * 2;

    static degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    static radiansToDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    static clamp(value, min, max) {
        return Math.max(Math.min(value, max), min);
    }

    static map(value, iMin, iMax, eMin, eMax) {
          return ((value - iMin) / (iMax - iMin)) * (eMax - eMin) + eMin;
    }

    static smoothstep(t) {
        return t * t * (3.0 - 2.0 * t);
    }

    static smootherstep(t) {
        let t3 = 10 * t * t * t;
        let t4 = 1.5 * t3 * t;
        let t5 = 0.4 * t4 * t;

        return t5 - t4 + t3;
    }

    static easeinsine(x) {
        return 1 - Math.cos((x * Math.PI) / 2);
    }

    static easeoutsine(x) {
        return Math.sin((x * Math.PI) / 2);
    }

    static easeinoutsine(x) {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }

    static easeinquad(x) {
        return x * x;
    }

    static easeoutquad(x) {
        return 1 - (1 - x) * (1 - x);
    }

    static easeinoutquad(x) {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }

    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    static sigmoidNormalised(x) {
        return 1 / (1 + Math.exp(-(x * 10 - 0.5)));
    }
}

class MouseListener {
    constructor(target, {mousedown = () => {}, mousemove = () => {}, mouseup = () => {}, mouseenter = () => {}, mouseleave = () => {}}) {
        this.target = target;

        this.mousedown = mousedown;
        this.mousemove = mousemove;
        this.mouseup = mouseup;
        this.mouseenter = mouseenter;
        this.mouseleave = mouseleave;

        this.setup();
    }

    setup() {
        this.target.addEventListener('mousedown', this.mousedown);
        this.target.addEventListener('mousemove', this.mousemove);
        this.target.addEventListener('mouseup', this.mouseup);
        this.target.addEventListener('mouseenter', this.mouseup);
        this.target.addEventListener('mouseleave', this.mouseup);
    }

    setListeners({mousedown = this.mousedown, mousemove = this.mousemove, mouseup = this.mouseup, mouseenter = this.mouseenter, mouseleave = this.mouseleave}) {
        this.mousedown = mousedown;
        this.mousemove = mousemove;
        this.mouseup = mouseup;
        this.mouseenter = mouseenter;
        this.mouseleave = mouseleave;
    }
}

class KeyboardListener {
    constructor(target, {keydown = () => {}, keypress = () => {}, keyup = () => {}}) {
        this.target = target;
        
        this.keydown = keydown;
        this.keypress = keypress;
        this.keyup = keyup;

        this.setup();
    }

    setup() {
        this.target.addEventListener('keydown', this.keydown);
        this.target.addEventListener('keypress', this.keypress);
        this.target.addEventListener('keyup', this.keyup);
    }

    setListeners({keydown = this.keydown, keypress = this.keypress, keyup = this.keyup}) {
        this.keydown = keydown;
        this.keypress = keypress;
        this.keyup = keyup;
    }
}