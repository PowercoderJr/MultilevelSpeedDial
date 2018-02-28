/*Описание констант*/
const BgType = {
    DEFAULT: 0,
    SOLID: 1,
    IMAGE: 2
}
Object.freeze(BgType);

const ElementType = {
    EMPTY: 0,
    BOOKMARK: 1,
    FOLDER: 2
}
Object.freeze(ElementType);

const StrongString = {
    SEPARATOR: "_",
    ELEMENT: "el",
    CAPTION: "cap"
}
Object.freeze(StrongString);

const DEFAULT_BGCOLOR = "#F9F9FA";
/*Окончание описания констант*/

/*Описание прототипов*/
var Element = function(code) {
    this.type = ElementType.EMPTY;
    this.code = code;
}
Element.prototype.whoAreYou = function() {
    console.log("I am " + this.type + " #" + this.code + ", ")
}
Element.prototype.generateHtml = function() {
    return '<div class="element" id="' + StrongString.ELEMENT + StrongString.SEPARATOR + this.code + '">' +
            '<div class="elementHeader"><img src="http://google.com/favicon.ico">' +
            '<label class="elementCaption" id="' + StrongString.CAPTION + StrongString.SEPARATOR + this.code + '">' +
            'Подпись подпись подпись подпись подпись подпись подпись подпись подпись подпись</label>' +
            '<img class="elementButton" src="icons/refresh.png">' +
            '<img class="elementButton" src="icons/edit.png">' +
            '<img class="elementButton" src="icons/delete.png"></div></div>';
}
Element.prototype.bindHtml = function() {
    //this????
}

var Bookmark = function(code) {
    Element.apply(this, [code]);
    this.type = ElementType.BOOKMARK;
}
Bookmark.prototype = Object.create(Element.prototype);
Bookmark.prototype.constructor = Bookmark;

var Folder = function(code, rows, cols) {
    Element.apply(this, [code]);
    this.type = ElementType.FOLDER;
    this.rows = rows;
    this.cols = cols;
    this.bgtype = BgType.DEFAULT;
    this.bgdata = null;

    let square = rows * cols;
    this.elements = new Array(square);
    for (let i = 0; i < square; ++i) {
        this.elements[i] = new Element(i + 1);
    }
}
Folder.prototype = Object.create(Element.prototype);
Folder.prototype.constructor = Folder;
/*Окончание описания прототипов*/

var currPath;

window.onload = function() {
    currPath = "";
    browser.storage.local.get({structure: new Folder(0, 3, 3)}).then(onStructureLoaded, onStructireLoadFailed);
}

function onStructureLoaded(results) {
    console.log("Results: ");
    for (let key in results) {
        console.log(results[key]);
    }
    buildPage(results.structure);
}

function onStructireLoadFailed(error) {
    console.log("Fail: " + error);
}

function buildPage(folder) {
    folder.bgtype = BgType.IMAGE;
    folder.bgdata = "https://pp.userapi.com/c621515/v621515823/7470c/gUhs_I6VmrM.jpg";

    switch (folder.bgtype) {
        case BgType.DEFAULT:
            document.body.style.backgroundColor = DEFAULT_BGCOLOR;
            document.body.style.backgroundImage = "";
            break;
        case BgType.SOLID:
            document.body.style.backgroundColor = folder.bgdata;
            document.body.style.backgroundImage = "";
            break;
        case BgType.IMAGE:
            document.body.style.backgroundColor = "";
            document.body.style.backgroundImage = "url('" + folder.bgdata + "')";
            break;
    }

    let grid = document.getElementById("grid");
    grid.innerHTML = "";
    for (let i = 0; i < folder.rows; ++i) {
        let row = grid.insertRow(i);
        for (let j = 0; j < folder.cols; ++j) {
            let cell = row.insertCell(j);
            let element = folder.elements[folder.cols * i + j];
            cell.innerHTML = Element.prototype.generateHtml.call(element);
            assignJsElement(element.code); //TODO: переписать
        }
    }
}

//TODO: внести в Element
function assignJsElement(code) {
    var element = new Element(code);
    document.getElementById(StrongString.ELEMENT + StrongString.SEPARATOR + code).onclick = element.whoAreYou.bind(element);
}
