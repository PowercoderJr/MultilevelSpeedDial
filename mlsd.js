/*Описание констант*/
const BgType = {
    DEFAULT: 0,
    SOLID: 1,
    IMAGE_LOCAL: 2,
    IMAGE_REMOTE: 3
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

const AssignmentMode = {
    CREATE: 0,
    EDIT: 1
}
Object.freeze(BgType);

const DEFAULT_BGCOLOR = "#F9F9FA";
/*Окончание описания констант*/

/*Описание прототипов*/
var Element = function(code) {
    this.type = ElementType.EMPTY;
    this.code = code;
    this.caption = "";
    this.icon = null;
    this.miniature = null;
    this.isCaptionHidden = false;
    this.isMiniatureHidden = false;
}
Element.prototype.whoAreYou = function() {
    console.log("I am " + this.type + " #" + this.code + ", ");
    showAssignmentForm(this, AssignmentMode.CREATE);
}
//TODO: переписать как добавление дочерних элементов
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
    this.url = url || "https://google.com/";
}
Bookmark.prototype = Object.create(Element.prototype);
Bookmark.prototype.constructor = Bookmark;

var Folder = function(code, rows, cols, bgtype, bgdata) {
    Element.apply(this, [code]);
    this.type = ElementType.FOLDER;
    this.rows = rows || 3;
    this.cols = cols || 3;
    this.bgtype = bgtype || BgType.DEFAULT;
    this.bgdata = bgdata || null;

    let amount = this.rows * this.cols;
    this.elements = new Array(amount);
    for (let i = 0; i < amount; ++i) {
        this.elements[i] = new Element(i + 1);
    }
}
Folder.prototype = Object.create(Element.prototype);
Folder.prototype.constructor = Folder;
/*Окончание описания прототипов*/

var currPath = "";
var rootFolder;
window.onload = function() {
    //browser.storage.local.clear();
    browser.storage.local.get({structure: new Folder(0)}).then(onStructureLoaded, onPromiseFailed);
    browser.storage.local.get().then(function(all) {
        console.log("Stored data: ");
        for (let key in all) 
            console.log(key + " = " + all[key]);
    }, onPromiseFailed);

    /*Вставка строк из файлов локализации*/
    document.getElementById("cellAssignmentTitle").innerHTML += browser.i18n.getMessage("cellAssignmentTitle") + " - " + browser.i18n.getMessage("extensionName");
    document.getElementById("cellCodeLabel").innerHTML += browser.i18n.getMessage("cellCode") + ":";
    document.getElementById("cellTypeLabel").innerHTML += browser.i18n.getMessage("cellType") + ":";
    document.getElementById("bookmarkLabel").innerHTML += browser.i18n.getMessage("bookmark");
    document.getElementById("folderLabel").innerHTML += browser.i18n.getMessage("folder");
    document.getElementById("generalSettingsLabel").innerHTML += browser.i18n.getMessage("generalSettings");
    document.getElementById("hideCaptionLabel").innerHTML += browser.i18n.getMessage("hideCaption");
    document.getElementById("hideMiniatureLabel").innerHTML += browser.i18n.getMessage("hideMiniature");
    document.getElementById("bookmarkSettingsLabel").innerHTML += browser.i18n.getMessage("bookmarkSettings");
    document.getElementById("urlLabel").innerHTML += browser.i18n.getMessage("url") + ": ";
    document.getElementById("folderSettingsLabel").innerHTML += browser.i18n.getMessage("folderSettings") + ":";
    document.getElementById("gridSizeLabel").innerHTML += browser.i18n.getMessage("gridSize") + ": ";
    document.getElementById("bgLabel").innerHTML += browser.i18n.getMessage("background") + ":";
    document.getElementById("defaultBgLabel").innerHTML += browser.i18n.getMessage("default");
    document.getElementById("colorBgLabel").innerHTML += browser.i18n.getMessage("color") + ": ";
    document.getElementById("imgLocalBgLabel").innerHTML += browser.i18n.getMessage("imageLocal") + ": ";
    document.getElementById("imgRemoteBgLabel").innerHTML += browser.i18n.getMessage("imageRemote") + ": ";
    document.getElementById("okBtn").value = browser.i18n.getMessage("ok");
    document.getElementById("cancelBtn").value = browser.i18n.getMessage("cancel");
    document.getElementById("bgimgUrlTf").title = browser.i18n.getMessage("imgUrlRequired");

    /*Инициализация формы назначения ячейки*/
    //document.getElementById("assignmentForm").action = "javascript:onAssignmentFormPosted";
    document.getElementById("assignmentForm").onsubmit = submitAssignmentForm;
    document.getElementById("curtain").onclick = onCurtainClicked;

    let onElementTypeChanged = function () {
        document.getElementById("bookmarkSettings").disabled = !document.getElementById("bookmarkRb").checked;
        document.getElementById("folderSettings").disabled = !document.getElementById("folderRb").checked;
    }
    let radioButtons = document.getElementsByName("elementType");
    radioButtons.forEach(function(item) {
        item.oninput = onElementTypeChanged;
    });

    let onBgtypeChanged = function () {
        document.getElementById("bgcolorPicker").disabled = !document.getElementById("colorBgRb").checked;
        document.getElementById("bgimgPicker").disabled = !document.getElementById("imgLocalBgRb").checked;
        document.getElementById("bgimgUrlTf").disabled = !document.getElementById("imgRemoteBgRb").checked;
    }
    radioButtons = document.getElementsByName("bgtype");
    radioButtons.forEach(function(item) {
        item.oninput = onBgtypeChanged;
    });

    document.getElementById("cancelBtn").onclick = hideAssignmentForm;
}

function onStructureLoaded(results) {
    console.log("results in onStructureLoaded:")
    console.log(results);
    console.log("-- onStructureLoaded end --");
    rootFolder = results.structure;
    buildPage(rootFolder);
}

function onPromiseFailed(error) {
    console.log(browser.i18n.getMessage("errMsg") + ": " + error);
}

function buildPage(folder) {
    folder.bgtype = BgType.IMAGE_REMOTE;
    folder.bgdata = "https://pp.userapi.com/c621515/v621515823/7470c/gUhs_I6VmrM.jpg";

    /*Установка фона*/
    let background = document.getElementById("background");
    switch (folder.bgtype) {
        case BgType.DEFAULT:
            background.style.backgroundColor = DEFAULT_BGCOLOR;
            background.style.backgroundImage = "";
            break;
        case BgType.SOLID:
            background.style.backgroundColor = folder.bgdata;
            background.style.backgroundImage = "";
            break;
        case BgType.IMAGE_LOCAL:
        case BgType.IMAGE_REMOTE:
            background.style.backgroundColor = "";
            background.style.backgroundImage = "url('" + folder.bgdata + "')";
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
            let html;
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
    //document.documentElement.style.setProperty("--codeFontSize", "min(" + codeFontSizeH + "," + codeFontSizeV + ")"); //TODO: min() не используется в CSS3 - ref #4
    document.documentElement.style.setProperty("--codeFontSize", codeFontSizeV);
}

//https://stackoverflow.com/questions/1369035/how-do-i-prevent-a-parents-onclick-event-from-firing-when-a-child-anchor-is-cli
function areYouFirstHand(event) {
    event = window.event || event;
    return this === event.target;
}

function showAssignmentForm(element, mode) {
    document.getElementById("assignmentForm").reset();
    document.getElementById("modeTf").value = mode;
    document.getElementById("codeTf").value = element.code;

    if (mode == AssignmentMode.CREATE) {
        console.log("Drasti");
        document.getElementById("bookmarkSettings").disabled = false;
        document.getElementById("folderSettings").disabled = true;
        document.getElementById("bookmarkRb").checked = true;
        document.getElementById("defaultBgRb").checked = true;
        document.getElementById("bgcolorPicker").disabled = true;
        document.getElementById("bgimgPicker").disabled = true;
        document.getElementById("bgimgUrlTf").disabled = true;
    }
    else if (mode == AssignmentMode.EDIT) {
        console.log("element in showAssignmentForm:");
        console.log(element);
        document.getElementById("bookmarkSettings").disabled = !(document.getElementById("bookmarkRb").checked = element.type == ElementType.BOOKMARK || element.type == ElementType.EMPTY);
        document.getElementById("folderSettings").disabled = !(document.getElementById("folderRb").checked = element.type == ElementType.FOLDER);
        if (element.type == ElementType.BOOKMARK) {
            document.getElementById("urlTf").value = element.url;
            document.getElementById("defaultBgRb").checked = true;
            document.getElementById("bgcolorPicker").disabled = !(document.getElementById("colorBgRb").checked = false);
            document.getElementById("bgimgPicker").disabled = !(document.getElementById("imgLocalBgRb").checked = false);
            document.getElementById("bgimgUrlTf").disabled = !(document.getElementById("imgRemoteBgRb").checked = false);
        }
        else if (element.type == ElementType.FOLDER) {
            document.getElementById("rowsSpin").value = element.rows;
            document.getElementById("colsSpin").value = element.cols;
            document.getElementById("defaultBgRb").checked = element.bgtype == BgType.DEFAULT;
            document.getElementById("bgcolorPicker").disabled = !(document.getElementById("colorBgRb").checked = element.bgtype == BgType.SOLID);
            document.getElementById("bgimgPicker").disabled = !(document.getElementById("imgLocalBgRb").checked = element.bgtype == BgType.IMAGE_LOCAL);
            document.getElementById("bgimgUrlTf").disabled = !(document.getElementById("imgRemoteBgRb").checked = element.bgtype == BgType.IMAGE_REMOTE);
            switch (element.bgtype) {
                case (BgType.SOLID):
                    document.getElementById("bgcolorPicker").value = element.bgdata;
                    break;
                case (BgType.IMAGE_LOCAL):
                    //document.getElementById("bgimgPicker").value = element.bgdata; //SecurityError: The operation is insecure
                    break;
                case (BgType.IMAGE_REMOTE):
                    document.getElementById("bgimgUrlTf").value = element.bgdata;
                    break;
            }
        }

        document.getElementById("hideCaptionChb").checked = element.isCaptionHidden;
        document.getElementById("hideMiniatureChb").checked = element.isMiniatureHidden;
    }

    document.getElementById("curtain").style.display = "flex";
    document.getElementById("background").style.WebkitFilter = "contrast(0.25)";
}

function hideAssignmentForm() {
    document.getElementById("curtain").style.display = "none";
    document.getElementById("background").style.WebkitFilter = "";
}

function submitAssignmentForm() {
    //TODO: предупредить о потерях если пользователь сокращает размер сетки
    hideAssignmentForm();
    var curr = rootFolder;
    if (currPath != "")
    {
        let steps = currPath.split(".");
        for (let i = 0; i < steps.length; ++i)
            curr = curr.elements[steps[i] - 1];
    }
    let data = parseAssignmentForm();
    if (data.mode == AssignmentMode.CREATE)
        curr.elements[data.element.code - 1] = data.element;
    else if (data.mode == AssignmentMode.EDIT)
        ;//TODO: заменить необходимые поля

    let structure = rootFolder;
    browser.storage.local.set({structure});
    //TODO: перезаписать innerHTML изменённого элемента
    return false;
}

function parseAssignmentForm() {
    let result = null;
    let code = parseInt(document.getElementById("codeTf").value);
    if (document.getElementById("bookmarkRb").checked) {
        let url = document.getElementById("urlTf").value;
        result = new Bookmark(code, url);
    }
    else if (document.getElementById("folderRb").checked) {
        let rows = parseInt(document.getElementById("rowsSpin").value);
        let cols = parseInt(document.getElementById("colsSpin").value);

        let bgtype, bgdata;
        if (document.getElementById("defaultBgRb").checked) {
            bgtype = BgType.DEFAULT;
            bgdata = null;
        }
        else if (document.getElementById("colorBgRb").checked) {
            bgtype = BgType.SOLID;
            bgdata = document.getElementById("bgcolorPicker").value;
        }
        else if (document.getElementById("imgLocalBgRb").checked) {
            bgtype = BgType.IMAGE_LOCAL;
            bgdata = document.getElementById("bgimgPicker").value;
        }
        else if (document.getElementById("imgRemoteBgRb").checked) {
            bgtype = BgType.IMAGE_REMOTE;
            bgdata = document.getElementById("bgimgUrlTf").value;
        }
        result = new Folder(code, rows, cols, bgtype, bgdata);
    }

    result.isCaptionHidden = document.getElementById("hideCaptionChb").checked;
    result.isMiniatureHidden = document.getElementById("hideMiniatureChb").checked;
    return {element: result, mode: document.getElementById("modeTf").value};
}

function onCurtainClicked(event) {
    if (areYouFirstHand.call(this, event)) hideAssignmentForm();
}
