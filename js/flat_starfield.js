const MAX_FLUX = 4;
const STELLAR_DENSITY = 0.001;
let svgElt;
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
function generateStars(numStars, xMax, yMax) {
    let stars = [];
    for (let i = 0; i < numStars; ++i) {
        const star = {
            flux: Math.random() * MAX_FLUX,
            position: [Math.random() * xMax, Math.random() * yMax],
            color: tempToRgb(Math.random() * 29000 + 1000),
        };
        stars.push(star);
    }
    return stars;
}
function drawStars(stars) {
    const starCircleElts = stars.map(function (star) {
        const elt = document.createElement("circle");
        elt.setAttribute("cx", star.position[0].toString());
        elt.setAttribute("cy", star.position[1].toString());
        elt.setAttribute("r", Math.sqrt(star.flux).toString());
        elt.setAttribute("fill", `rgb(${star.color.join()})`);
        return elt;
    });
    svgElt.replaceChildren(...starCircleElts);
}
document.addEventListener("DOMContentLoaded", function () {
    svgElt = document.getElementById("background-svg");
    const numStars = svgElt.clientWidth * svgElt.clientHeight * STELLAR_DENSITY;
    drawStars(generateStars(numStars, svgElt.clientWidth, svgElt.clientHeight));
    svgElt.innerHTML += "";
});
export {};
