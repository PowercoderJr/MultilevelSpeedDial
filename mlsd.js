/*Описание констант*/

/**
 * enum Photon Colors JS Variables v3.0.1 
 *
 * Набор констант цветов, доступен по адресу:
 * https://firefoxux.github.io/design-tokens/photon-colors/photon-colors.js
 *
 * @var Object  PhotonColors
 */
const PhotonColors = {
    MAGENTA_50: '#ff1ad9',
    MAGENTA_60: '#ed00b5',
    MAGENTA_70: '#b5007f',
    MAGENTA_80: '#7d004f',
    MAGENTA_90: '#440027',

    PURPLE_50: '#9400ff',
    PURPLE_60: '#8000d7',
    PURPLE_70: '#6200a4',
    PURPLE_80: '#440071',
    PURPLE_90: '#25003e',

    BLUE_40: '#45a1ff',
    BLUE_50: '#0a84ff',
    BLUE_50_A30: '#0a84ff4c',
    BLUE_60: '#0060df',
    BLUE_70: '#003eaa',
    BLUE_80: '#002275',
    BLUE_90: '#000f40',

    TEAL_50: '#00feff',
    TEAL_60: '#00c8d7',
    TEAL_70: '#008ea4',
    TEAL_80: '#005a71',
    TEAL_90: '#002d3e',

    GREEN_50: '#30e60b',
    GREEN_60: '#12bc00',
    GREEN_70: '#058b00',
    GREEN_80: '#006504',
    GREEN_90: '#003706',

    YELLOW_50: '#ffe900',
    YELLOW_60: '#d7b600',
    YELLOW_70: '#a47f00',
    YELLOW_80: '#715100',
    YELLOW_90: '#3e2800',

    RED_50: '#ff0039',
    RED_60: '#d70022',
    RED_70: '#a4000f',
    RED_80: '#5a0002',
    RED_90: '#3e0200',

    ORANGE_50: '#ff9400',
    ORANGE_60: '#d76e00',
    ORANGE_70: '#a44900',
    ORANGE_80: '#712b00',
    ORANGE_90: '#3e1300',

    GREY_10: '#f9f9fa',
    GREY_20: '#ededf0',
    GREY_30: '#d7d7db',
    GREY_40: '#b1b1b3',
    GREY_50: '#737373',
    GREY_60: '#4a4a4f',
    GREY_70: '#38383d',
    GREY_80: '#2a2a2e',
    GREY_90: '#0c0c0d',
    GREY_90_A05: '#0c0c0d0c',
    GREY_90_A10: '#0c0c0d19',
    GREY_90_A20: '#0c0c0d33',
    GREY_90_A30: '#0c0c0d4c',
    GREY_90_A40: '#0c0c0d66',
    GREY_90_A50: '#0c0c0d7f',
    GREY_90_A60: '#0c0c0d99',
    GREY_90_A70: '#0c0c0db2',
    GREY_90_A80: '#0c0c0dcc',
    GREY_90_A90: '#0c0c0de5',

    INK_70: '#363959',
    INK_80: '#202340',
    INK_90: '#0f1126',

    WHITE_100: '#ffffff'
};
Object.freeze(PhotonColors);

/**
 * enum Тип фона
 *
 * @var Object  BgType
 */
const BgType = {
    DEFAULT: 0,
    SOLID: 1,
    IMAGE_LOCAL: 2,
    IMAGE_REMOTE: 3
}
Object.freeze(BgType);

/**
 * enum Тип элемента
 *
 * @var Object  ElementType
 */
const ElementType = {
    EMPTY: 0,
    BOOKMARK: 1,
    FOLDER: 2,
    BACKSTEP: 3
}
Object.freeze(ElementType);

/**
 * enum Ключевая строка
 *
 * @var Object  StrongString
 */
const StrongString = {
    SEPARATOR: "_",
    ELEMENT: "el",
    HEADER: "hdr",
    CAPTION: "cap",
    FAVICON: "fico",
    NUMBER: "number",
    MINIATURE: "mture",
    MINIATURE_BACKGROUND: "mturebg"
}
Object.freeze(StrongString);

/**
 * enum Режим назначения элемента
 *
 * @var Object  AssignmentMode
 */
const AssignmentMode = {
    CREATE: 0,
    EDIT: 1
}
Object.freeze(AssignmentMode);

/**
 * Цвет фона по умолчанию
 *
 * @var string  DEFAULT_BGCOLOR
 */
const DEFAULT_BGCOLOR = PhotonColors.GREY_10;
/*Окончание описания констант*/

/*Описание прототипов*/
/**
 * Конструктор Element
 *
 * @param   int number  Номер элемента
 */
var Element = function(number) {
    this.type = ElementType.EMPTY;
    this.number = number;
}
/**
 * Парсинг элемента
 *
 * Воссоздаёт объект элемента по
 * с заданным набором свойств
 *
 * @param   mixed   data    Набор свойств
 * @return  Element         Возвращает новый объект
 *                          элемента с заданными свойствами
 */
Element.prototype.parseObj = function(data) {
    return new Element(data.number);
}
/**
 * Обработчик нажатия
 *
 * @param   event   event   Событие
 */
Element.prototype.onClicked = function(event) {
    const container = document.getElementById(StrongString.ELEMENT +
            StrongString.SEPARATOR + this.number);
    const header = document.getElementById(StrongString.HEADER +
            StrongString.SEPARATOR + this.number);
    const favicon = document.getElementById(StrongString.FAVICON +
            StrongString.SEPARATOR + this.number);
    const caption = document.getElementById(StrongString.CAPTION +
            StrongString.SEPARATOR + this.number);
    const number = document.getElementById(StrongString.NUMBER +
            StrongString.SEPARATOR + this.number);

    console.log("Target is ", event.target);
    if (verifyTarget(event, [container, header, favicon, caption, number])) {
        this.action();
        return true;
    } else {
        return false;
    }
}
/**
 * Действие
 *
 * Реакция элемента на нажатие мыши
 */
Element.prototype.action = function() {
        showAssignmentForm(this, AssignmentMode.CREATE);
}
/**
 * Инициализация HTML-разметки
 *
 * Создаёт контейнер для элемента
 *
 * @param   int         number  Номер элемента
 * @return  HTMLElement         Возвращает контейнер 
 *                              в виде HTML-элемента
 */
Element.prototype.getInitHtml = function(number) {
    number = number || this.number;
    let newDiv = document.createElement("div");
    newDiv.className = "element";
    newDiv.id = StrongString.ELEMENT + StrongString.SEPARATOR + number;
    return newDiv;
}
/**
 * Генерация тела HTML-блока
 *
 * Генерирует тело HTML-блока на основе имеющихся свойств
 *
 * @return  DocumentFragment    Возвращает объект документа,
 *                              сгенерированный в соответствии с
 *                              типом элемента
 */
Element.prototype.getInnerHtml = function () {
    let miniature = document.createElement("div");
    miniature.className = "elementMiniature";
    miniature.id = StrongString.MINIATURE + StrongString.SEPARATOR + this.number;
    let newLabel = document.createElement("label");
    newLabel.className = "elementNumber";
    newLabel.id = StrongString.NUMBER + StrongString.SEPARATOR + this.number;
    newLabel.textContent = this.number;
    miniature.appendChild(newLabel);
    let df = document.createDocumentFragment();
    df.appendChild(miniature);
    return df;
}
/**
 * Привязка к HTML-элементу
 *
 * Назначает обработчик события onclick для HTML-элемента
 * с соответствующим id
 *
 * @param   int         number  Номер элемента
 * @return  HTMLElement         Возвращает контейнер 
 *                              в виде HTML-элемента
 */
Element.prototype.bindHtml = function() {
    let lookingfor = StrongString.ELEMENT + StrongString.SEPARATOR + this.number;
    document.getElementById(lookingfor).onclick =
            Element.prototype.onClicked.bind(this);
}

//Abstract
/**
 * Конструктор заполненного элемента
 *
 * @param   int number  Номер элемента
 */
var FilledElement = function(number) {
    Element.call(this, number);
    this.caption = "";
    this.icon = null;
    this.isCaptionHidden = false;
    this.isMiniatureHidden = false;
}
FilledElement.prototype = Object.create(Element.prototype);
FilledElement.prototype.constructor = FilledElement;
/**
 * {@link Element.prototype.parseObj}
 */
FilledElement.prototype.parseObj = function(data) {
    //TODO: Object.assign(result, data);
    let result = new FilledElement(data.number);
    result.type = data.type;
    result.caption = data.caption;
    result.icon = data.icon;
    result.isCaptionHidden = data.isCaptionHidden;
    result.isMiniatureHidden = data.isMiniatureHidden;
    return result;
}
/**
 * {@link Element.prototype.getInnerHtml}
 */
FilledElement.prototype.getInnerHtml = function () {
    let header = document.createElement("div");
    header.className = "elementHeader";
    header.id = StrongString.HEADER + StrongString.SEPARATOR + this.number;
    let icon = document.createElement("img");
    icon.id = StrongString.FAVICON + StrongString.SEPARATOR + this.number;
    icon.src = this.icon;
    header.appendChild(icon);
    let caption = document.createElement("label");
    caption.className = "elementCaption";
    caption.id = StrongString.CAPTION + StrongString.SEPARATOR + this.number;
    if (!this.isCaptionHidden) {
        caption.textContent = this.caption;
    }
    header.appendChild(caption);
    let btn1 = document.createElement("img");
    btn1.className = "elementButton";
    btn1.src = "icons/refresh.svg";
    header.appendChild(btn1);
    btn1.onclick = function() {
        restoreElement(currPath, this.number);
    }.bind(this);
    let btn2 = document.createElement("img");
    btn2.className = "elementButton";
    btn2.src = "icons/edit.svg";
    header.appendChild(btn2);
    btn2.onclick = function() {
        showAssignmentForm(this, AssignmentMode.EDIT);
    }.bind(this);
    let btn3 = document.createElement("img");
    btn3.className = "elementButton";
    btn3.src = "icons/delete.svg";
    header.appendChild(btn3);
    btn3.onclick = function() {
        if (confirm(browser.i18n.getMessage("rlyDeleteElement",
                [this.number, this.caption]))) {
            let empty = new Element(this.number);
            overwriteElement(currPath, empty);
        }
    }.bind(this);

    let df = Element.prototype.getInnerHtml.call(this);
    df.insertBefore(header, df.children[0]);
    let mture = df.getElementById(StrongString.MINIATURE +
            StrongString.SEPARATOR + this.number);
    return df;
}

/**
 * Конструктор элемента-закладки
 *
 * @param   int     number  Номер элемента
 * @param   string  url     Ссылка
 */
var Bookmark = function(number, url) {
    FilledElement.call(this, number);
    this.type = ElementType.BOOKMARK;
    this.url = url || "https://google.com/"; //DEBUG
    this.icon = "http://google.com/favicon.ico" //DEBUG
    this.caption = "Google";
    this.miniature = null;
}
Bookmark.prototype = Object.create(FilledElement.prototype);
Bookmark.prototype.constructor = Bookmark;
/**
 * {@link Element.prototype.parseObj}
 */
Bookmark.prototype.parseObj = function(data) {
    let result = new Bookmark(data.number, data.url);
    let superObj = FilledElement.prototype.parseObj.call(this, data);
    Object.assign(result, superObj);
    result.miniature = data.miniature;
    return result;
}
/**
 * {@link Element.prototype.action}
 */
Bookmark.prototype.action = function() {
    console.log("Здесь открывается закладка");
}
/**
 * {@link Element.prototype.getInitHtml}
 */
Bookmark.prototype.getInitHtml = function() {
    let newA = document.createElement("a");
    newA.className = "element";
    newA.id = StrongString.ELEMENT + StrongString.SEPARATOR + this.number;
    newA.href = this.url;
    return newA;
}
/**
 * {@link Element.prototype.getInnerHtml}
 */
Bookmark.prototype.getInnerHtml = function () {
    let df = FilledElement.prototype.getInnerHtml.call(this);
    /*let mture = df.getElementById(StrongString.MINIATURE +
            StrongString.SEPARATOR + this.number);
    switch (this.bgtype) {
        case BgType.DEFAULT:
            mture.style.backgroundColor = DEFAULT_BGCOLOR;
            mture.style.backgroundImage = "";
            break;
        case BgType.SOLID:
            mture.style.backgroundColor = this.bgdata;
            mture.style.backgroundImage = "";
            break;
        case BgType.IMAGE_LOCAL:
        case BgType.IMAGE_REMOTE:
            mture.style.backgroundColor = "";
            mture.style.backgroundImage = "url('" + this.bgdata + "')";
            break;
    }*/
    return df;
}

/**
 * Конструктор элемента-папки
 *
 * @param   int     number      Номер элемента
 * @param   string  caption     Название папки
 * @param   int     rows        Количество строк (по умолчанию 3)
 * @param   int     cols        Количество столбцов (по умолчанию 3)
 * @param   BgType  bgtype      Тип фона (по умолчанию стандартный)
 * @param   string  bgdata      Данные фона (по умолчанию null)
 * @param   string  bgviewstr   Отображаемая строка вместо данных фона
 *                              (по умолчанию пуста)
 */
var Folder = function(number, caption, rows = 3, cols = 3, 
        bgtype = BgType.DEFAULT, bgdata = null, bgviewstr = "") {
    FilledElement.call(this, number);
    this.type = ElementType.FOLDER;
    this.caption = caption;
    this.icon = "icons/folder.svg";
    this.rows = rows > 0 ? rows : 1;
    this.cols = cols > 0 ? cols : 1;
    this.bgtype = bgtype;
    this.bgdata = bgdata;
    this.bgviewstr = bgviewstr;

    let amount = this.rows * this.cols;
    this.elements = new Array(amount);
    if (this.number > 0) {
        this.elements[0] = new BackstepElement();
    } else {
        this.elements[0] = new Element(1);
    }
    for (let i = 1; i < amount; ++i) {
        this.elements[i] = new Element(i + 1);
    }
}
Folder.prototype = Object.create(FilledElement.prototype);
Folder.prototype.constructor = Folder;
/**
 * {@link Element.prototype.parseObj}
 */
Folder.prototype.parseObj = function(data) {
    let result = new Folder(data.number, data.caption, data.rows, data.cols, data.bgtype, data.bgdata, data.bgviewstr);
    let superObj = FilledElement.prototype.parseObj.call(this, data);
    Object.assign(result, superObj);
    result.elements = data.elements;
    return result;
}
/**
 * {@link Element.prototype.action}
 */
Folder.prototype.action = function() {
    console.log("Здесь открывается папка");
    currPath.push(this.number);
    buildPage(this);
}
/**
 * {@link Element.prototype.getInnerHtml}
 */
Folder.prototype.getInnerHtml = function () {
    let df = FilledElement.prototype.getInnerHtml.call(this);
    
    if (!this.isMiniatureHidden) {
        let mture = df.getElementById(StrongString.MINIATURE +
                StrongString.SEPARATOR + this.number);
        switch (this.bgtype) {
            case BgType.DEFAULT:
                mture.style.backgroundColor = DEFAULT_BGCOLOR;
                mture.style.backgroundImage = "";
                break;
            case BgType.SOLID:
                mture.style.backgroundColor = this.bgdata;
                mture.style.backgroundImage = "";
                break;
            case BgType.IMAGE_LOCAL:
            case BgType.IMAGE_REMOTE:
                mture.style.backgroundColor = "";
                mture.style.backgroundImage = "url('" + this.bgdata + "')";
                break;
        }
    }
    return df;
}

/**
 * Конструктор элемента "Шаг назад"
 *
 * @param   int number  Номер элемента
 */
var BackstepElement = function(number = 1) {
    Element.call(this, number);
    this.type = ElementType.BACKSTEP;
}
BackstepElement.prototype = Object.create(Element.prototype);
BackstepElement.prototype.constructor = BackstepElement;
/**
 * {@link Element.prototype.parseObj}
 */
BackstepElement.prototype.parseObj = function(data) {
    return new BackstepElement();
}
/**
 * {@link Element.prototype.action}
 */
BackstepElement.prototype.action = function() {
    console.log("Здесь открывается предыдущая папка");
    currPath.pop();
    buildPage(getFolderByPath(currPath));
}
/**
 * {@link Element.prototype.getInnerHtml}
 */
BackstepElement.prototype.getInnerHtml = function () {
    let df = Element.prototype.getInnerHtml.call(this);
    let label = df.getElementById(StrongString.NUMBER + StrongString.SEPARATOR + this.number);
    label.textContent = "←";
    return df;
}

//Ещё ENUM
/**
 * enum Парсер элемента
 *
 * @var Object ElementFactoryByType
 */
const ElementFactoryByType = {
    [ElementType.EMPTY]: Element.prototype.parseObj,
    [ElementType.BOOKMARK]: Bookmark.prototype.parseObj,
    [ElementType.FOLDER]: Folder.prototype.parseObj,
    [ElementType.BACKSTEP]: BackstepElement.prototype.parseObj
}
Object.freeze(ElementFactoryByType);
/*Окончание описания прототипов*/

/**
 * Текущий путь
 *
 * Хранит последовательность номеров элементов-папок, которая
 * ведёт от корневой папки к текущей
 *
 * @var Stack   currPath
 */
var currPath = [];
/**
 * Корневая папка
 *
 * Содержит всю структуру элементов, определённую пользователем
 *
 * @var Folder  rootFolder
 */
var rootFolder;
window.onload = function() {
    //browser.storage.local.clear();
    browser.storage.local.get('structure').then(onStructureLoaded, onPromiseFailed);
    browser.storage.local.get().then(function(all) {
        console.log("Stored data: ");
        for (let key in all) {
            console.log(key + " = " + all[key]);
        }
    }, onPromiseFailed);

    /*Вставка строк из файлов локализации*/
    document.getElementById("cellAssignmentTitle").innerHTML += browser.i18n.getMessage("cellAssignmentTitle") + " - " + browser.i18n.getMessage("extensionName");
    document.getElementById("cellNumberLabel").innerHTML += browser.i18n.getMessage("cellNumber") + ":";
    document.getElementById("cellTypeLabel").innerHTML += browser.i18n.getMessage("cellType") + ":";
    document.getElementById("bookmarkLabel").innerHTML += browser.i18n.getMessage("bookmark");
    document.getElementById("folderLabel").innerHTML += browser.i18n.getMessage("folder");
    document.getElementById("generalSettingsLabel").innerHTML += browser.i18n.getMessage("generalSettings");
    document.getElementById("hideCaptionLabel").innerHTML += browser.i18n.getMessage("hideCaption");
    document.getElementById("hideMiniatureLabel").innerHTML += browser.i18n.getMessage("hideMiniature");
    document.getElementById("bookmarkSettingsLabel").innerHTML += browser.i18n.getMessage("bookmarkSettings");
    document.getElementById("urlLabel").innerHTML += browser.i18n.getMessage("url") + ": ";
    document.getElementById("folderSettingsLabel").innerHTML += browser.i18n.getMessage("folderSettings") + ":";
    document.getElementById("folderNameLabel").innerHTML += browser.i18n.getMessage("folderName") + ": ";
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
        document.getElementById("bookmarkSettings").disabled =
                !document.getElementById("bookmarkRb").checked;
        document.getElementById("folderSettings").disabled =
                !document.getElementById("folderRb").checked;
    }
    let bufControls = document.getElementsByName("elementType");
    bufControls.forEach(function(item) {
        item.oninput = onElementTypeChanged;
    });

    let onBgtypeChanged = function () {
        document.getElementById("bgcolorPicker").disabled =
                !document.getElementById("colorBgRb").checked;
        document.getElementById("bgimgPicker").disabled =
                !document.getElementById("imgLocalBgRb").checked;
        document.getElementById("bgimgUrlTf").disabled =
                !document.getElementById("imgRemoteBgRb").checked;
    }
    bufControls = document.getElementsByName("bgtype");
    bufControls.forEach(function(item) {
        item.oninput = onBgtypeChanged;
    });

    let onGridSizeChanged = function () {
        const oldAmount = document.getElementById("rowsOld").value *
                document.getElementById("colsOld").value;
        const newAmount = document.getElementById("rowsSpin").value *
                document.getElementById("colsSpin").value;
        if (newAmount < oldAmount) {
            const elements = getFolderByPath(currPath, rootFolder).
                    elements[document.getElementById("numberTf").value - 1].
                    elements;
            let nBookmarks = 0;
            let nFolders = 0;
            for (let i = newAmount; i < oldAmount; ++i) {
                switch (elements[i].type) {
                    case ElementType.BOOKMARK:
                        ++nBookmarks;
                        break;
                    case ElementType.FOLDER:
                        ++nFolders;
                        break;
                }
            }

            if (nBookmarks + nFolders > 0) {
                let getEnding = function(n) {
                    const locale = browser.i18n.getMessage("@@ui_locale");
                    if (locale == "ru") {
                        if (n % 100 != 11 && n % 10 == 1) {
                            return browser.i18n.getMessage("endingCase1")
                        } else if ((n % 100 < 12 || n % 100 > 14) &&
                                n % 10 >= 2 && n % 10 <= 4) {
                            return browser.i18n.getMessage("endingCase2")
                        } else {
                            return browser.i18n.getMessage("endingCase0")
                        }
                    } else if (locale == "en") {
                        return n == 1 ? "" : "s";
                    }
                }
                const endingBookmarks = getEnding(nBookmarks);
                const endingFolders = getEnding(nFolders);
                document.getElementById("elemsWillBeLostLabel").textContent = 
                        browser.i18n.getMessage("elemsWillBeLost", [newAmount,
                        nBookmarks, endingBookmarks, nFolders, endingFolders]);
                document.getElementById("elemsWillBeLostLabel").style.display = "initial";
            } else {
                document.getElementById("elemsWillBeLostLabel").textContent = "";
                document.getElementById("elemsWillBeLostLabel").style.display = "none";
            }
        } else {
            document.getElementById("elemsWillBeLostLabel").textContent = "";
            document.getElementById("elemsWillBeLostLabel").style.display = "none";
        }
    }
    bufControls = document.getElementsByName("gridSize");
    bufControls.forEach(function(item) {
        item.oninput = onGridSizeChanged;
    });

    document.getElementById("cancelBtn").onclick = hideAssignmentForm;
}

/**
 * Инициализация корневой папки {@link rootFolder}
 *
 * Выполняется при успешной операции чтения структуры элементов из
 * локального хранилища. Функция будет вызвана также в случае, если
 * структура не была найдена в хранилище. Тогда параметр results будет
 * пустым, а структура будет создана с параметрами по умолчанию.
 * Вызывает функцию построения страницы папки {@link buildPage}
 *
 * @param   mixed   results    Результат чтения
 */
function onStructureLoaded(results) {
    console.log("results in onStructureLoaded:")
    console.log(results);
    console.log("-- onStructureLoaded end --");
    if (results.structure) {
        rootFolder = results.structure;
    } else {
        rootFolder = new Folder(-1, browser.i18n.getMessage("extensionName"));
        let structure = rootFolder;
        browser.storage.local.set({structure});
    }
    buildPage(rootFolder);
}

/**
 * Сообщение об ошибке Promise
 *
 * Печатает в консоль сообщение об ошибке, произошедшей в ходе
 * выполнения Promise
 *
 * @param   string  error   Сообщение
 */
function onPromiseFailed(error) {
    console.log(browser.i18n.getMessage("errMsg") + ": " + error);
}

/**
 * Построение страницы папки
 *
 * Генерирует и отображает страницу на основе объекта папки
 *
 * @param   Folder  folder  Элемент-папка
 */
function buildPage(folder) {
    /*folder.bgtype = BgType.IMAGE_REMOTE; //DEBUG
    folder.bgdata = "https://pp.userapi.com/c621515/v621515823/7470c/gUhs_I6VmrM.jpg";*/

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
            let number = folder.cols * i + j + 1;
            cell.appendChild(Element.prototype.getInitHtml(number));
            //restoreElement(currPath, number);
            rebuildElement(folder.elements[number - 1]);
        }
    }

    /*Установка размера шрифта для номеров элементов*/
    let amount = folder.rows * folder.cols;
    let digits;
    for (digits = 0; amount > 1; ++digits) {
        amount /= 10;
    }

    window.onresize = function() {
        let numberHTML = document.getElementById(StrongString.NUMBER
                + StrongString.SEPARATOR + "1");
        let size = Math.min(numberHTML.offsetWidth * 0.9 / digits,
                numberHTML.offsetHeight);
        document.documentElement.style.setProperty("--numberFontSize", size + "px");
    }

    //Множитель borderSize = (лишнийОтступСетки + границыЭлемента)
    /*let numberFontSizeH = "calc((100vw - var(--borderSize) * (1 + (1 + 1) * " + 
            folder.cols + ")) / " + folder.cols + " / " + digits + ")";
    let numberFontSizeV = "calc((100vh - var(--borderSize) * (1 + (4 + 1) * " + 
            folder.rows + ")) / " + folder.rows + ")";
    //document.documentElement.style.setProperty("--numberFontSize", "min(" + numberFontSizeH + "," + numberFontSizeV + ")"); //TODO: min() не используется в CSS3 - ref #4
    document.documentElement.style.setProperty("--numberFontSize", numberFontSizeH);*/
    window.onresize();
}

/**
 * Пересоздание элемента
 *
 * Пересоздаёт элемент и заменяет старый HTML-блок новым
 *
 * @param   Element element Элемент
 */
function rebuildElement(element) {
    element = verifyElementObject(element);
    let oldElement = document.getElementById(StrongString.ELEMENT + 
            StrongString.SEPARATOR + element.number);
    let parent = oldElement.parentElement;
    oldElement.remove();
    let elementHtml = element.getInitHtml();
    elementHtml.appendChild(element.getInnerHtml());
    parent.appendChild(elementHtml);
    element.bindHtml();
}

//https://stackoverflow.com/questions/1369035/how-do-i-prevent-a-parents-onclick-event-from-firing-when-a-child-anchor-is-cli
/**
 * Проверка цели события
 *
 * Определяет, находится ли цель события среди переданных объектов
 *
 * @param   event       event               Событие
 * @param   Array       allowedTargets      Массив сверяемых объектов
 * @return  boolean                         Возвращает true, если цель
 *                                          события находится среди
 *                                          сверяемых объектов, иначе
 *                                          возвращает false.
 */
function verifyTarget(event, allowedTargets) {
    event = window.event || event;
    return allowedTargets.some(function(curr) {
        return event.target === curr;
    });
}

/**
 * Отображение формы назначения элемента
 *
 * Очищает или заполняет поля формы назначения элемента в соответствии
 * с назначаемым элементом и отображает форму поверх остального UI.
 *
 * @param   Element         element Номер элемента
 * @param   AssignmentMode  mode    Режим назначения
 */
function showAssignmentForm(element, mode) {
    window.getSelection().removeAllRanges();
    document.getElementById("assignmentForm").reset();
    document.getElementById("bgimgBase64").value = "";
    document.getElementById("bgimgPicker").required = true;
    document.getElementById("numberTf").value = element.number;
    document.getElementById("elemsWillBeLostLabel").textContent = "";
    document.getElementById("elemsWillBeLostLabel").style.display = "none";
    document.getElementById("imgLocalBgSpinner").style.display = "none";

    if (mode == AssignmentMode.CREATE) {
        document.getElementById("bookmarkSettings").disabled = false;
        document.getElementById("folderSettings").disabled = true;
        document.getElementById("bookmarkRb").checked = true;
        document.getElementById("defaultBgRb").checked = true;
        document.getElementById("bgcolorPicker").disabled = true;
        document.getElementById("bgimgPicker").disabled = true;
        document.getElementById("bgimgUrlTf").disabled = true;
    }
    else if (mode == AssignmentMode.EDIT) {
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
            document.getElementById("folderNameTf").value = element.caption;
            document.getElementById("rowsSpin").value = element.rows;
            document.getElementById("colsSpin").value = element.cols;
            document.getElementById("rowsOld").value = element.rows;
            document.getElementById("colsOld").value = element.cols;
            document.getElementById("defaultBgRb").checked = element.bgtype == BgType.DEFAULT;
            document.getElementById("bgcolorPicker").disabled = !(document.getElementById("colorBgRb").checked = element.bgtype == BgType.SOLID);
            document.getElementById("bgimgPicker").disabled = !(document.getElementById("imgLocalBgRb").checked = element.bgtype == BgType.IMAGE_LOCAL);
            document.getElementById("bgimgUrlTf").disabled = !(document.getElementById("imgRemoteBgRb").checked = element.bgtype == BgType.IMAGE_REMOTE);
            switch (element.bgtype) {
                case (BgType.SOLID):
                    document.getElementById("bgcolorPicker").value = element.bgdata;
                    break;
                case (BgType.IMAGE_LOCAL):
                    if (element.bgviewstr.length == 0) {
                        document.getElementById("bgimgPicker").required = true;
                        document.getElementById("bgimgBase64").value = "";
                    } else {
                        //TODO: отобразить имя файла, если он был указан ранее https://stackoverflow.com/a/17949302
                        //document.getElementById("bgimgPicker").value = element.bgviewstr; //SecurityError: The operation is insecure
                        document.getElementById("bgimgPicker").required = false;
                        document.getElementById("bgimgBase64").value = element.bgdata;
                    }
                    break;
                case (BgType.IMAGE_REMOTE):
                    if (element.bgviewstr.length == 0) {
                        document.getElementById("bgimgUrlTf").value = "";
                        document.getElementById("bgimgUrlTf").required = true;
                        document.getElementById("bgimgBase64").value = "";
                    } else {
                        document.getElementById("bgimgUrlTf").value = element.bgviewstr;
                        document.getElementById("bgimgUrlTf").required = false;
                        document.getElementById("bgimgBase64").value = element.bgdata;
                    }
                    break;
            }
        }

        document.getElementById("hideCaptionChb").checked = element.isCaptionHidden;
        document.getElementById("hideMiniatureChb").checked = element.isMiniatureHidden;
    }

    document.getElementById("curtain").style.display = "flex";
    document.getElementById("background").style.WebkitFilter = "contrast(0.25)";
}

/**
 * Сокрытие формы назначения элемента
 *
 * Скрывает форму назначения элемента
 */
function hideAssignmentForm() {
    document.getElementById("curtain").style.display = "none";
    document.getElementById("background").style.WebkitFilter = "";
}

/**
 * Публикация информации с формы назначения элемента
 *
 * Считывает информацию, указанную пользователем на форме
 * назначения элемента и перезаписывает прежний элемент
 * новым, созданным на основе указанных свойств.
 * {@link parseAssignmentForm}
 */
function submitAssignmentForm() {
    //TODO: parseAssignmentForm(>true<), если режим - редактирование
    hideAssignmentForm();
    parseAssignmentForm(true).then(function (element) {
        console.log(element);
        overwriteElement(currPath, element);
    });
    return false;
}

/**
 * Парсинг формы назначения элемента
 *
 * Считывает информацию с формы назначения элемента и
 * записывает её в новый объект.
 *
 * @param   boolean copyElems   Копировать ли в новый объект структуру элементов
 *                              (актуально, если редактируется элемент-папка)
 * @return  Promise             Возвращает Promise, который в случае успеха
 *                              предоставляет объект со считанными свойствами элемента
 */
async function parseAssignmentForm(copyElems) {
    let result = null;
    let number = parseInt(document.getElementById("numberTf").value);
    if (document.getElementById("bookmarkRb").checked) {
        let url = document.getElementById("urlTf").value;
        result = new Bookmark(number, url);
    }
    else if (document.getElementById("folderRb").checked) {
        let caption = document.getElementById("folderNameTf").value;
        let rows = parseInt(document.getElementById("rowsSpin").value);
        let cols = parseInt(document.getElementById("colsSpin").value);

        let bgtype, bgdata, bgviewstr;
        if (document.getElementById("defaultBgRb").checked) {
            bgtype = BgType.DEFAULT;
            bgdata = null;
            bgviewstr = "";
        }
        else if (document.getElementById("colorBgRb").checked) {
            bgtype = BgType.SOLID;
            bgdata = document.getElementById("bgcolorPicker").value;
            bgviewstr = "";
        }
        else if (document.getElementById("imgLocalBgRb").checked) {
            bgtype = BgType.IMAGE_LOCAL;
            const picker = document.getElementById("bgimgPicker");
            if (picker.files.length > 0) {
                let file = document.getElementById("bgimgPicker").files[0];                
                document.getElementById("imgLocalBgSpinner").style.display = "initial";
                await readFile(file).then(function(data) {bgdata = data;},
                        onPromiseFailed);
                bgviewstr = document.getElementById("bgimgPicker").files[0].name;
            } else {
                bgdata = document.getElementById("bgimgBase64").value;
                bgviewstr = "Какой-то файл.жыпэг";
            }
        }
        else if (document.getElementById("imgRemoteBgRb").checked) {
            bgtype = BgType.IMAGE_REMOTE;
            bgdata = document.getElementById("bgimgUrlTf").value; //TODO: to base64
            bgviewstr = document.getElementById("bgimgUrlTf").value;
        }
        result = new Folder(number, caption, rows, cols, bgtype, bgdata, bgviewstr);
        if (copyElems) {
            let src = getFolderByPath(currPath, rootFolder).elements[number - 1];
            if (src.type == ElementType.FOLDER) {
                const bound = Math.min(src.elements.length, rows * cols);
                for (let i = 0; i < bound; ++i) {
                    result.elements[i] = src.elements[i];
                }
            }
        }
    }

    result.isCaptionHidden = document.getElementById("hideCaptionChb").checked;
    result.isMiniatureHidden = document.getElementById("hideMiniatureChb").checked;
    return result;
}

/**
 * Загрузка файла
 *
 * Считывает файл с компьютера
 * 
 * @param   File    file    Выбранный файл
 * @return  Promise         Возвращает Promise, который в случае успеха
 *                          предоставляет считанную информацию в виде
 *                          строки base64; в случае неудачи - сообщение
 *                          об ошибке.
 */
function readFile(file) {
    return new Promise((resolve, reject) => {    
        let reader = new FileReader();
        reader.onloadend = function() {
            document.getElementById("imgLocalBgSpinner").style.display = "none";
            if (reader.result) {
                resolve(reader.result);
            } else {
                reject(browser.i18n.getMessage("unableToLoadImg"));
            }
        }
        reader.readAsDataURL(file);
    });
}

/**
 * Обработчик нажатия на штору
 *
 * Реагирует на нажатие мыши за пределами формы назначения элемента
 */
function onCurtainClicked(event) {
    if (verifyTarget(event, [document.getElementById("curtain")])) {
        hideAssignmentForm();
    }
}

/**
 * Перезапись элемента
 *
 * Перезаписывает элемент в хранилище по заданному пути. В случае,
 * если путь совпадает с текущим, перестраивает HTML-представление
 * элемента на странице.
 *
 * @param   Array   path    Путь
 * @param   Element element Новый элемент
 */
function overwriteElement(path, element) {
    let folder = getFolderByPath(path, rootFolder);
    element = verifyElementObject(element);
    folder.elements[element.number - 1] = element;

    /*let oldElement = document.getElementById(StrongString.ELEMENT + 
            StrongString.SEPARATOR + element.number);
    let parent = oldElement.parentElement;
    oldElement.remove();
    let elementHtml = element.getInitHtml();
    elementHtml.appendChild(element.getInnerHtml());
    parent.appendChild(elementHtml);
    element.bindHtml();*/
    if (path == currPath) {
        rebuildElement(element);
    }

    let structure = rootFolder;
    browser.storage.local.set({structure});
}

/**
 * Восстановление элемента из хранилища
 *
 * Считывает элемент с заданным номером из хранилища по заданному пути.
 * В случае, если путь совпадает с текущим, перестраивает
 * HTML-представление элемента на странице.
 *
 * @param   Array   path    Путь
 * @param   Element element Новый элемент
 */
function restoreElement(path, number) {
    browser.storage.local.get("structure").then(function(result) {
        let folder = getFolderByPath(path, result.structure);
        let element = folder.elements[number - 1];
        //overwriteElement(path, element);
        if (path == currPath) {
            rebuildElement(element);
        }
    }, onPromiseFailed);
}

/**
 * Переход по пути
 *
 * Проходит со стартовой папки по заданному пути и возвращает
 * объект последней папки.
 *
 * @param   Array   path        Путь
 * @param   Folder  startDir    Стартовая папка. Если не указана,
 *                              по умолчанию берётся корневая папка.
 */
function getFolderByPath(path, startDir) {
    let folder = startDir || rootFolder;
    for (let i = 0; i < path.length; ++i) {
        folder = folder.elements[path[i] - 1];
    }
    return folder;
}

/**
 * Реконструирование элемента
 *
 * Проверяет, является ли переданный объект экземпляром Element
 * или экземпляром его наследников. В случае, если не является -
 * создаёт новый объект с свойствами, хранящимися в аргументе.
 * {@link Element.prototype.parseObj}
 *
 * @param   Object  element Объект, который, предположительно,
 *                          является экземпляром Element
 */
function verifyElementObject(element) {
    //if (!element.getInitHtml) {
    if (!(element instanceof Element)) {
        element = ElementFactoryByType[element.type](element);
    }
    return element;
}
