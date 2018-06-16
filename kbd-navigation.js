let inputMode = false;
let isUiShown = false;
let pathString;

let curtain = document.createElement("div");
curtain.style.position = "fixed";
curtain.style.top = "0px";
curtain.style.bottom = "0px";
curtain.style.left = "0px";
curtain.style.right = "0px";
curtain.style.display = "none";
curtain.style.justifyContent = "center";
curtain.style.alignItems = "center";

let ui = document.createElement("div");
ui.style.width = "700px";
ui.style.height = "200px";
ui.style["background-color"] = "#0c0c0de5"; //grey-90-a90

window.addEventListener("load", function() {
    curtain.appendChild(ui);
    document.body.appendChild(curtain);
});


window.onkeydown = function(event) {
    if (event.key === "Control" && !inputMode) {
        inputMode = true;
        pathString = "";
    }
}

window.onkeypress = function(event) {
    console.log(event);
    if (inputMode) {
        if (event.key === "Backspace" && pathString.length > 0) {
            pathString = pathString.substring(0, pathString.length - 1)
        } else {
            let newPathString = pathString + event.key;
            if (newPathString.match(/^([1-9]\d*\/?)*$/) !== null) {
                isUiShown = true;
                curtain.style.display = "flex";
                pathString = newPathString;
                ui.innerText = newPathString;
            }
        }
    }

    if (isUiShown) {
        event.preventDefault();
    }
}

window.onkeyup = function(event) {
    if (event.key === "Control") {
        inputMode = false;
        isUiShown = false;
        curtain.style.display = "none";
    }
}

function isNumber(str) {
    let trimmed = str.trim();
    console.log(isNaN(trimmed));
    return trimmed.length > 0 && !isNaN(trimmed);
}
