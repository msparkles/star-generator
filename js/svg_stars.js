"use strict";
let svgElt;
function randRange(min, max) {
    return Math.random() * (max - min) + min;
}
function pxConstrain(n) {
    if (n < 0)
        return 0;
    if (n > 255)
        return 255;
    return n;
}
function tempToRgb(kelvin) {
    const hectokelvin = kelvin / 100;
    const red = ((hectokelvin <= 66)
        ? 255
        : pxConstrain(329.698727446 * (hectokelvin - 60) ** -0.1332047592));
    const green = ((hectokelvin <= 66)
        ? pxConstrain(99.4708025861 * Math.log(hectokelvin) - 161.1195681661)
        : pxConstrain(288.1221695283 * ((hectokelvin - 60) ** -0.0755148492)));
    const blue = ((hectokelvin >= 66)
        ? 255
        : ((hectokelvin <= 19)
            ? 0
            : pxConstrain(138.5177312231 * Math.log(hectokelvin - 10)
                - 305.0447927307)));
    return [red, green, blue];
}
class Range3D {
    lowerBound;
    upperBound;
    constructor(lowerBound, upperBound) {
        if (lowerBound[0] > upperBound[0]
            || lowerBound[1] > upperBound[1]
            || lowerBound[2] > upperBound[2]) {
            throw new Error(`Invalid range (received ${lowerBound}, ${upperBound})`);
        }
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }
    randPoint() {
        return [
            randRange(this.lowerBound[0], this.upperBound[0]),
            randRange(this.lowerBound[1], this.upperBound[1]),
            randRange(this.lowerBound[2], this.upperBound[2]),
        ];
    }
    volume() {
        return (this.upperBound[0] - this.lowerBound[0])
            * (this.upperBound[1] - this.lowerBound[1])
            * (this.upperBound[2] - this.lowerBound[2]);
    }
    contains(point) {
        return (point[0] >= this.lowerBound[0] && point[0] <= this.upperBound[0]
            && point[1] >= this.lowerBound[1] && point[1] <= this.upperBound[1]
            && point[2] >= this.lowerBound[2] && point[2] <= this.upperBound[2]);
    }
}
class Star {
    static MAX_LUMINOSITY = 4;
    static MIN_TEMP = 2000;
    static MAX_TEMP = 30000;
    temperature;
    luminosity;
    position;
    constructor(range) {
        this.temperature = randRange(Star.MIN_TEMP, Star.MAX_TEMP);
        this.luminosity = randRange(0, Star.MAX_LUMINOSITY);
        this.position = range.randPoint();
    }
}
class Universe {
    size;
    stellarDensity;
    stars;
    constructor(initialSize, stellarDensity) {
        this.size = initialSize;
        this.stellarDensity = stellarDensity;
        this.stars = [];
        this.populateStars(this.size);
    }
    populateStars(range) {
        const numStars = this.stellarDensity * range.volume();
        const fracPart = numStars % 1;
        const genStars = ((fracPart === 0)
            ? numStars
            : ((Math.random() < fracPart)
                ? Math.floor(numStars)
                : Math.ceil(numStars)));
        console.log("Started generating stars:", genStars);
        for (let i = 0; i < genStars; i++) {
            this.stars.push(new Star(range));
        }
    }
    translate(delta) {
        for (const star of this.stars) {
            star.position[0] += delta[0];
            star.position[1] += delta[1];
            star.position[2] += delta[2];
        }
    }
    cleanStars() {
        this.stars = this.stars.filter(star => this.size.contains(star.position));
    }
}
class Observer {
    location;
    #window;
    depth;
    universe;
    constructor(distance, depth, stellarDensity, windowBound) {
        this.location = [0, 0, -distance];
        this.depth = depth;
        this.setWindow(windowBound);
        this.universe = new Universe(this.#universeSize(), stellarDensity);
    }
    #universeSize() {
        return new Range3D([
            (this.#window.lowerBound[0] - this.location[0])
                / (this.#window.lowerBound[2] - this.location[2])
                * (this.depth - this.location[2]),
            (this.#window.lowerBound[1] - this.location[1])
                / (this.#window.lowerBound[2] - this.location[2])
                * (this.depth - this.location[2]),
            0
        ], [
            (this.#window.upperBound[0] - this.location[0])
                / (this.#window.upperBound[2] - this.location[2])
                * (this.depth - this.location[2]),
            (this.#window.upperBound[1] - this.location[1])
                / (this.#window.upperBound[2] - this.location[2])
                * (this.depth - this.location[2]),
            this.depth,
        ]);
    }
    setWindow(windowBound) {
        this.#window = new Range3D([-windowBound[0], -windowBound[1], 0], [windowBound[0], windowBound[1], 0]);
        // TODO: Resize Universe
    }
    render() {
        const rendered = [];
        for (const star of this.universe.stars) {
            const flux = star.luminosity
                / ((star.position[2] - this.location[2]) ** 2);
            const color = tempToRgb(star.temperature);
            const position = [
                (star.position[0] - this.location[0])
                    / (star.position[2] - this.location[2])
                    * -this.location[2],
                (star.position[1] - this.location[1])
                    / (star.position[2] - this.location[2])
                    * -this.location[2],
            ];
            const apparentRadius = Math.sqrt(flux);
            if (position[0] < this.#window.lowerBound[0] - apparentRadius
                || position[0] > this.#window.upperBound[0] + apparentRadius
                || position[1] < this.#window.lowerBound[1] - apparentRadius
                || position[1] > this.#window.upperBound[1] + apparentRadius) {
                continue;
            }
            const screenX = position[0] - this.#window.lowerBound[0];
            const screenY = position[1] - this.#window.lowerBound[1];
            const elt = document.createElement("circle");
            elt.setAttribute("cx", screenX.toString());
            elt.setAttribute("cy", screenY.toString());
            elt.setAttribute("r", apparentRadius.toString());
            elt.setAttribute("fill", `rgb(${color.join()})`);
            rendered.push(elt);
        }
        return rendered;
    }
}
document.addEventListener("DOMContentLoaded", function () {
    svgElt = document.getElementById("background-svg");
    const obs = new Observer(1, 3, 1e-4, [svgElt.clientWidth / 2,
        svgElt.clientHeight / 2]);
    const rendered = obs.render();
    svgElt.replaceChildren(...rendered);
    svgElt.innerHTML += "";
    setInterval(() => {
        const startTime = Date.now();
        obs.universe.translate([0, 1, 0]);
        const rendered = obs.render();
        console.log("Render time:", Date.now() - startTime);
        svgElt.replaceChildren(...rendered);
        svgElt.innerHTML += "";
        console.log("Execution time:", Date.now() - startTime);
    }, 50);
});
export {};
