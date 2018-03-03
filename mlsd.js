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
    this.caption = "";
    this.icon = null;
    this.miniature = null;
}
Element.prototype.whoAreYou = function() {
    console.log("I am " + this.type + " #" + this.code + ", ");
}
Element.prototype.generateHtml = function() {
    return '<div class="element" id="' + StrongString.ELEMENT + StrongString.SEPARATOR + this.code + '">' +
            '<div class="elementHeader"><img src="http://google.com/favicon.ico">' +
            '<label class="elementCaption" id="' + StrongString.CAPTION + StrongString.SEPARATOR + this.code + '">' +
            'Подпись подпись подпись подпись подпись подпись подпись подпись подпись подпись</label>' +
            '<img class="elementButton" src="icons/refresh.png">' +
            '<img class="elementButton" src="icons/edit.png">' +
            '<img class="elementButton" src="icons/delete.png"></div><div class="elementMiniature">' + 
            '<label class="elementCode">' + this.code + '</label></div></div>';
}
Element.prototype.bindHtml = function() {
    document.getElementById(StrongString.ELEMENT + StrongString.SEPARATOR +
            this.code).onclick = Element.prototype.whoAreYou.bind(this);
}

var Bookmark = function(code, url) {
    Element.apply(this, [code]);
    this.type = ElementType.BOOKMARK;
    this.url = url;
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

    let amount = rows * cols;
    this.elements = new Array(amount);
    for (let i = 0; i < amount; ++i) {
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

    /*Вставка строк из файлов локализации*/
    document.getElementById("cellAssignmentTitle").innerHTML += browser.i18n.getMessage("cellAssignmentTitle") + " - " + browser.i18n.getMessage("extensionName");
    document.getElementById("cellTypeLabel").innerHTML += browser.i18n.getMessage("cellType") + ":";
    document.getElementById("bookmarkRb").innerHTML += browser.i18n.getMessage("bookmark");
    document.getElementById("folderRb").innerHTML += browser.i18n.getMessage("folder");
    document.getElementById("generalSettingsLabel").innerHTML += browser.i18n.getMessage("generalSettings");
    document.getElementById("hideCaptionChb").innerHTML += browser.i18n.getMessage("hideCaption");
    document.getElementById("hideMiniatureChb").innerHTML += browser.i18n.getMessage("hideMiniature");
    document.getElementById("bookmarkSettingsLabel").innerHTML += browser.i18n.getMessage("bookmarkSettings");
    document.getElementById("urlLabel").innerHTML += browser.i18n.getMessage("url") + ": ";
    document.getElementById("folderSettingsLabel").innerHTML += browser.i18n.getMessage("folderSettings") + ":";
    document.getElementById("gridSizeLabel").innerHTML += browser.i18n.getMessage("gridSize") + ": ";
    document.getElementById("bgLabel").innerHTML += browser.i18n.getMessage("background") + ":";
    document.getElementById("defaultBgRb").innerHTML += browser.i18n.getMessage("default");
    document.getElementById("colorBgLabel").innerHTML += browser.i18n.getMessage("color") + ": ";
    document.getElementById("imgLocalBgLabel").innerHTML += browser.i18n.getMessage("imageLocal") + ": ";
    document.getElementById("imgRemoteBgLabel").innerHTML += browser.i18n.getMessage("imageRemote") + ": ";
}

function onStructureLoaded(results) {
    buildPage(results.structure);
}

function onStructireLoadFailed(error) {
    console.log("Fail: " + error);
}

function buildPage(folder) {
    folder.bgtype = BgType.IMAGE;
    folder.bgdata = "https://pp.userapi.com/c621515/v621515823/7470c/gUhs_I6VmrM.jpg";

    /*Установка фона*/
    let bg = document.getElementById("bg");
    switch (folder.bgtype) {
        case BgType.DEFAULT:
            bg.style.backgroundColor = DEFAULT_BGCOLOR;
            bg.style.backgroundImage = "";
            break;
        case BgType.SOLID:
            bg.style.backgroundColor = folder.bgdata;
            bg.style.backgroundImage = "";
            break;
        case BgType.IMAGE:
            bg.style.backgroundColor = "";
            bg.style.backgroundImage = "url('" + folder.bgdata + "')";
            break;
    }

    /*Создание и размещение элементов*/
    let grid = document.getElementById("grid");
    grid.innerHTML = "";
    for (let i = 0; i < folder.rows; ++i) {
        let row = grid.insertRow(i);
        for (let j = 0; j < folder.cols; ++j) {
            let cell = row.insertCell(j);
            let element = folder.elements[folder.cols * i + j];
            cell.innerHTML = Element.prototype.generateHtml.call(element);
            Element.prototype.bindHtml.call(element);
        }
    }

    /*Установка размера шрифта для кодов элементов*/
    let amount = folder.rows * folder.cols;
    let digits;
    for (digits = 0; amount > 1; ++digits)
        amount /= 10;
    //Множитель borderSize = (лишнийОтступСетки + границыЭлемента)
    let codeFontSizeH = "calc((100vw - var(--borderSize) * (1 + (1 + 1) * " + 
            folder.cols + ")) / " + folder.cols + " / " + digits + ")";
    let codeFontSizeV = "calc((100vh - var(--borderSize) * (1 + (4 + 1) * " + 
            folder.rows + ")) / " + folder.rows + ")";
    //document.documentElement.style.setProperty("--codeFontSize", "min(" + codeFontSizeH + "," + codeFontSizeV + ")"); //TODO: min() не используется в CSS3
    document.documentElement.style.setProperty("--codeFontSize", codeFontSizeV);
}
