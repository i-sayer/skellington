/* javascript module for quartz clock component
*/
export function initClock(options){
    options = options||{};
    let clock = document.querySelector(".clock");
    let setQuickTimer = function (ev){
        let duration = ev.target.textContent / 5;
        let Now = new Date();
        let Minute = Now.getMinutes();
        let Second = Now.getSeconds()/60;
        console.log(duration, Minute);
        clock.style.setProperty("--time-start", (Minute+Second)/5);
        clock.style.setProperty("--duration", duration);
    }
    let setClockHeight = function(){
        let sz = Math.min(visualViewport.height,visualViewport.width) - 32;
        clock.style.setProperty("--clock-height", sz);
    }
    if (clock){
        setClockHeight();
        // remove any b or span in case this is a resize
        clock.querySelectorAll('b,span').forEach(el=>{
            clock.removeChild(el);
        });
        let svgcircle = clock.querySelector("circle");
        let numHours = (getComputedStyle(svgcircle)).getPropertyValue("--hours")||12;
        let dd = Math.PI*2/numHours; // angle between digits 2PI/12
        let ow = clock.offsetWidth;
        let ra = ow / 2.11 - (ow / 18); // inner radius for digit position
        // set dash-array for tick marks because Firefox doesn't work with CSS and calc
        if (svgcircle) {
            let circ60th = ((getComputedStyle(svgcircle)).getPropertyValue("--clock-height") * 3.1415927) / (numHours*5);
            svgcircle.setAttribute("stroke-dasharray", `${circ60th * 0.2} ${circ60th * 0.8}`);
            svgcircle.setAttribute("stroke-dashoffset", `${circ60th * 0.12}`);
        }
        let hours = [];
        if (numHours==12)
            hours = [12,1,2,3,4,5,6,7,8,9,10,11];
        else
            hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
        hours.forEach((n,i)=>{
            let b = document.createElement("b");

            b.append(n.toString());
            b.style.translate = `${Math.sin(i*dd)*ra}px ${Math.cos(i*dd)*-ra}px`;
            b.style.setProperty("--i", i);
            b.addEventListener("click",setQuickTimer);
            clock.append(b);
        });
        ["hand hour","hand","hand sec"].forEach(h=>{
            let hand = document.createElement("span");
            hand.className = h;
            clock.append(hand);
        });
        if (options.start){
            let duration = options.duration||2;
            clock.style.setProperty("--time-start", options.start);
            clock.style.setProperty("--duration", duration);
        }
        let updateHands = function(){
            let now = new Date();
            let s = now.getSeconds();
            let m = now.getMinutes() + (s/60);
            let h = now.getHours() + (m/60);
            clock.style.setProperty("--sec-angle", `${360/60*s}deg`);
            clock.style.setProperty("--minute-angle", `${360/60*m}deg`);
            clock.style.setProperty("--hour-angle", `${360/12*h}deg`);
            let secondsHand = clock.querySelector(".sec");
            if (secondsHand&&secondsHand.animate){
                // this uses the new JS animation API (if available) to create the tick 'overshoot' effect
                secondsHand.animate([{rotate:"3deg"},{rotate:"-2deg"},{rotate:"1deg"},{rotate:"0deg"}],{duration:180,composite:"accumulate"});
            }
        }
        updateHands();
        setInterval(updateHands, 1000);
    }
}
