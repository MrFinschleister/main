let animatorKey = {
    "linear": 0,
    "smoothstep": 1,
    "smootherstep": 2,
    "easeinsine": 3,
    "easeoutsine": 4,
    "easeinoutsine": 5,
    "easeinquad": 6,
    "easeoutquad": 7,
    "easeinoutquad": 8,
}

let animatorModes = {
    0: (x) => {return x},
    1: (x) => {return Math2.smoothstep(x)},
    2: (x) => {return Math2.smootherstep(x)},
    3: (x) => {return Math2.easeinsine(x)},
    4: (x) => {return Math2.easeoutsine(x)},
    5: (x) => {return Math2.easeinoutsine(x)},
    6: (x) => {return Math2.easeinquad(x)},
    7: (x) => {return Math2.easeoutquad(x)},
    8: (x) => {return Math2.easeinoutquad(x)},
}

class Animator {
    constructor(startValue = Vector3.neutral(), endValue = Vector3.neutral(), duration = 1, mode = 0) {
        this.startValue = startValue;
        this.endValue = endValue;
        this.currentValue = startValue;

        this.duration = duration;
        this.completion = 0;

        this.mode = mode;
    }

    tick(dt = 1) {
        if (dt == 0 || this.duration == 0) {
            return;
        }

        let completion = (this.completion += dt);

        let startValue = this.startValue;
        let endValue = this.endValue;
        let duration = this.duration;

        let completionPercent = completion / duration;
        let initialWeight = completionPercent % 2 < 1 ? completionPercent % 1 : 1 - completionPercent % 1;
        let usedWeight = animatorModes[this.mode](initialWeight);

        this.currentValue = startValue.lerp(endValue, usedWeight);
    }
}

class GenericAnimator {
    constructor(startValue, endValue, duration, mode, autoReverse = false) {
        this.startValue = startValue;
        this.endValue = endValue;

        this.duration = duration;
        this.completion = 0;
        this.mode = mode;
        this.autoReverse = false;
    }

    tick(dt = 1) {
        this.completion += dt;
    }

    getValue() {
        let completionPercent = this.completion / this.duration;
        let initialWeight = this.autoReverse ? completionPercent % 2 < 1 ? completionPercent % 1 : 1 - completionPercent % 1 : completionPercent % 1;
        let usedWeight = animatorModes[this.mode](initialWeight);

        return this.startValue.lerp(this.endValue, usedWeight);
    }
}

class PositionAnimator extends GenericAnimator {
    constructor(startPosition, endPosition, duration, mode, autoReverse = false) {
        super(startPosition, endPosition, duration, mode, autoReverse);
    }

    getValue() {
        return super.getValue();
    }
}

class RotationAnimator extends GenericAnimator {
    constructor(startRotation, endRotation, duration, mode, autoReverse = false) {
        super(startRotation, endRotation, duration, mode, autoReverse);
    }

    getValue() {
        return super.getValue();
    }
}

class RevolvingPositionAnimator extends GenericAnimator {
    constructor(position, revolutionOrigin, startRotation, endRotation, duration, mode, autoReverse = false) {
        super(startRotation, endRotation, duration, mode, autoReverse);

        this.position = position;
        this.revolutionOrigin = revolutionOrigin;
    }

    getValue() {
        return this.position.rotateRad(super.getValue(), this.revolutionOrigin);
    }
}