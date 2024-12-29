"use strict";

type HTMLSVGElement = HTMLElement | SVGElement;
type Coords2D = [x: number, y: number];
type Coords3D = [x: number, y: number, z: number];
type RgbColor = [r: number, g: number, b: number];
type Circle = {
    radius: number,
    position: Coords2D,
    color: RgbColor,
    opacity: number,
};

function randRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function pxConstrain(n: number): number {
    if (n < 0) return 0;
    if (n > 255) return 255;
    return n;
}

function tempToRgb(kelvin: number): RgbColor {
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
    readonly lowerBound: Coords3D;
    readonly upperBound: Coords3D;

    constructor(lowerBound: Coords3D, upperBound: Coords3D) {
        if (lowerBound[0] > upperBound[0]
            || lowerBound[1] > upperBound[1]
            || lowerBound[2] > upperBound[2]) {
            throw new Error(
                `Invalid range (received ${lowerBound}, ${upperBound})`);
        }
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }

    randPoint(): Coords3D {
        return [
            randRange(this.lowerBound[0], this.upperBound[0]),
            randRange(this.lowerBound[1], this.upperBound[1]),
            randRange(this.lowerBound[2], this.upperBound[2]),
        ];
    }

    volume(): number {
        return (this.upperBound[0] - this.lowerBound[0])
            * (this.upperBound[1] - this.lowerBound[1])
            * (this.upperBound[2] - this.lowerBound[2]);
    }

    contains(point: Coords3D): boolean {
        return (
            point[0] >= this.lowerBound[0] && point[0] <= this.upperBound[0]
            && point[1] >= this.lowerBound[1] && point[1] <= this.upperBound[1]
            && point[2] >= this.lowerBound[2] && point[2] <= this.upperBound[2]
        );
    }
}

class Star {
    static readonly MAX_LUMINOSITY = 4;
    static readonly MIN_TEMP = 2000;
    static readonly MAX_TEMP = 30000;

    temperature: number;
    luminosity: number;
    position: Coords3D;

    constructor(range: Range3D) {
        this.temperature = randRange(Star.MIN_TEMP, Star.MAX_TEMP);
        this.luminosity = randRange(0, Star.MAX_LUMINOSITY);
        this.position = range.randPoint();
    }
}

class Universe {
    size: Range3D;
    stellarDensity: number;
    stars: Star[];

    constructor(initialSize: Range3D, stellarDensity: number) {
        this.size = initialSize;
        this.stellarDensity = stellarDensity;
        this.stars = [];
        this.populateStars(this.size);
    }

    populateStars(range: Range3D): void {
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

    translateY(deltaY: number): void {
        for (const star of this.stars) {
            star.position[1] += deltaY;
        }
        this.cleanStars();
        this.populateStars(new Range3D(this.size.lowerBound,
            [this.size.upperBound[0], this.size.lowerBound[1] + deltaY,
            this.size.upperBound[2]]));
    }

    cleanStars(): void {
        this.stars = this.stars.filter(star =>
            this.size.contains(star.position));
    }

    resize(newSize: Range3D): void {
        if (newSize.upperBound[0] > this.size.upperBound[0]) {
            this.populateStars(new Range3D([this.size.upperBound[0],
            this.size.lowerBound[1], this.size.lowerBound[2]],
                [newSize.upperBound[0], this.size.upperBound[1],
                this.size.upperBound[2]]));
        }
        if (newSize.lowerBound[0] < this.size.lowerBound[0]) {
            this.populateStars(new Range3D([newSize.lowerBound[0],
            this.size.lowerBound[1], this.size.lowerBound[2]],
                [this.size.lowerBound[0], this.size.upperBound[1],
                this.size.upperBound[2]]));
        }
        if (newSize.upperBound[1] > this.size.upperBound[1]) {
            this.populateStars(new Range3D([newSize.lowerBound[0],
            this.size.upperBound[1], this.size.lowerBound[2]],
                [newSize.upperBound[0], newSize.upperBound[1],
                this.size.upperBound[2]]));
        }
        if (newSize.lowerBound[1] < this.size.lowerBound[1]) {
            this.populateStars(new Range3D([newSize.lowerBound[0],
            newSize.lowerBound[1], this.size.lowerBound[2]],
                [newSize.upperBound[0], this.size.lowerBound[1],
                this.size.upperBound[2]]));
        }
        if (newSize.upperBound[2] > this.size.upperBound[2]) {
            this.populateStars(new Range3D([newSize.lowerBound[0],
            newSize.lowerBound[1], this.size.upperBound[2]],
                [newSize.upperBound[0], newSize.lowerBound[1],
                newSize.upperBound[2]]));
        }
        if (newSize.lowerBound[2] < this.size.lowerBound[2]) {
            this.populateStars(new Range3D([newSize.lowerBound[0],
            newSize.lowerBound[1], newSize.lowerBound[2]],
                [newSize.upperBound[0], newSize.lowerBound[1],
                this.size.lowerBound[2]]));
        }
        this.size = newSize;
        this.cleanStars();
    }
}

class Observer {
    readonly location: Coords3D;
    #window!: Range3D;
    readonly depth: number;
    readonly universe: Universe;

    constructor(distance: number, depth: number, stellarDensity: number,
        windowBound: Coords2D) {
        this.location = [0, 0, -distance];
        this.depth = depth;
        this.setWindow(windowBound);
        this.universe = new Universe(
            this.#universeSize(),
            stellarDensity
        )
    }

    #universeSize(): Range3D {
        return new Range3D(
            [
                (this.#window.lowerBound[0] - this.location[0])
                / (this.#window.lowerBound[2] - this.location[2])
                * (this.depth - this.location[2]),
                (this.#window.lowerBound[1] - this.location[1])
                / (this.#window.lowerBound[2] - this.location[2])
                * (this.depth - this.location[2]),
                0
            ],
            [
                (this.#window.upperBound[0] - this.location[0])
                / (this.#window.upperBound[2] - this.location[2])
                * (this.depth - this.location[2]),
                (this.#window.upperBound[1] - this.location[1])
                / (this.#window.upperBound[2] - this.location[2])
                * (this.depth - this.location[2]),
                this.depth,
            ]
        );
    }

    setWindow(windowBound: Coords2D): void {
        if (windowBound[0] === this.#window?.upperBound[0]
            && windowBound[1] === this.#window?.upperBound[1]) {
            return;
        }
        this.#window = new Range3D(
            [-windowBound[0], -windowBound[1], 0],
            [windowBound[0], windowBound[1], 0]
        );
        this.universe?.resize(this.#universeSize());
    }

    flatten(): Circle[] {
        const flattened: Circle[] = [];
        for (const star of this.universe.stars) {

            const position: Coords2D = [
                (star.position[0] - this.location[0])
                / (star.position[2] - this.location[2])
                * -this.location[2],
                (star.position[1] - this.location[1])
                / (star.position[2] - this.location[2])
                * -this.location[2],
            ];

            const flux = star.luminosity
                / ((star.position[2] - this.location[2]) ** 2);
            const apparentRadius = Math.sqrt(flux);

            if (position[0] < this.#window.lowerBound[0] - apparentRadius
                || position[0] > this.#window.upperBound[0] + apparentRadius
                || position[1] < this.#window.lowerBound[1] - apparentRadius
                || position[1] > this.#window.upperBound[1] + apparentRadius) {
                continue;
            }

            const color = tempToRgb(star.temperature);
            const screenX = position[0] - this.#window.lowerBound[0];
            const screenY = position[1] - this.#window.lowerBound[1];

            const [renderedRadius, opacity] = ((apparentRadius >= 1)
                ? [apparentRadius, 1]
                : [1, flux]);

            flattened.push({
                radius: renderedRadius,
                position: [screenX, screenY],
                color: color,
                opacity: opacity,
            });
        }
        return flattened;
    }
}

function drawCircle(ctx: CanvasRenderingContext2D, circle: Circle): void {
    ctx.fillStyle = `rgb(${circle.color.join(" ")} / ${circle.opacity * 100}%)`;
    ctx.beginPath();
    ctx.arc(circle.position[0], circle.position[1], circle.radius,
        0, 2 * Math.PI);
    ctx.fill();
}

function profile(name: string, f: () => any) {
    const startTime = performance.now();
    const temp = f();
    const elapsed = performance.now() - startTime;
    console.log(name, elapsed);
    return temp;
}

document.addEventListener("DOMContentLoaded", function () {
    const canvasElt = <HTMLCanvasElement>document.getElementById("background-canvas");
    canvasElt.width = window.innerWidth;
    canvasElt.height = window.innerHeight;
    const ctx = canvasElt.getContext("2d", {alpha: false});
    if (ctx === null) {
        throw new Error("2d context not supported");
    }
    const obs = new Observer(1, 3, 1e-4, [canvasElt.width / 2, canvasElt.height / 2]);
    let lastUpdated = performance.now();
    function render(): void {
        const timeNow = performance.now();
        const timeElapsed = timeNow - lastUpdated;
        lastUpdated = timeNow;
        console.log("Time since last frame:", timeElapsed);
        if (canvasElt.width !== window.innerWidth) {
            canvasElt.width = window.innerWidth;
        }
        if (canvasElt.height !== window.innerHeight) {
            canvasElt.height = window.innerHeight;
        }
        obs.setWindow([canvasElt.width / 2, canvasElt.height / 2]);
        profile("Translate:", () => obs.universe.translateY(timeElapsed * 0.02));
        const flattened: Circle[] = profile("Flatten:", () => obs.flatten());
        profile("Draw:", () => {
            ctx!.clearRect(0, 0, canvasElt.width, canvasElt.height);
            flattened.forEach((circle) => drawCircle(ctx!, circle));
        });
        requestAnimationFrame(render);
    }
    render();
});
