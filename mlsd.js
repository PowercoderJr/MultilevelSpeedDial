/*Описание констант*/

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
    CODE: "code",
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
const DEFAULT_BGCOLOR = "#B1B1B3";
/*Окончание описания констант*/

/*Описание прототипов*/
/**
 * Конструктор Element
 *
 * @param   int     code    Код элемента
 */
var Element = function(code) {
    this.type = ElementType.EMPTY;
    this.code = code;
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
    return new Element(data.code);
}
/**
 * Обработчик нажатия
 *
 * @param   event   event   Событие
 */
Element.prototype.onClicked = function(event) {
    const container = document.getElementById(StrongString.ELEMENT +
            StrongString.SEPARATOR + this.code);
    const header = document.getElementById(StrongString.HEADER +
            StrongString.SEPARATOR + this.code);
    const favicon = document.getElementById(StrongString.FAVICON +
            StrongString.SEPARATOR + this.code);
    const caption = document.getElementById(StrongString.CAPTION +
            StrongString.SEPARATOR + this.code);
    const code = document.getElementById(StrongString.CODE +
            StrongString.SEPARATOR + this.code);

    console.log("Target is ", event.target);
    if (verifyTarget(event, [container, header, favicon, caption, code])) {
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
 * @param   int         code    Код элемента
 * @return  HTMLElement         Возвращает контейнер 
 *                              в виде HTML-элемента
 */
Element.prototype.getInitHtml = function(code) {
    code = code || this.code;
    let newDiv = document.createElement("div");
    newDiv.className = "element";
    newDiv.id = StrongString.ELEMENT + StrongString.SEPARATOR + code;
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
    miniature.id = StrongString.MINIATURE + StrongString.SEPARATOR + this.code;
    let newLabel = document.createElement("label");
    newLabel.className = "elementCode";
    newLabel.id = StrongString.CODE + StrongString.SEPARATOR + this.code;
    newLabel.textContent = this.code;
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
 * @param   int         code    Код элемента
 * @return  HTMLElement         Возвращает контейнер 
 *                              в виде HTML-элемента
 */
Element.prototype.bindHtml = function() {
    let lookingfor = StrongString.ELEMENT + StrongString.SEPARATOR + this.code;
    document.getElementById(lookingfor).onclick =
            Element.prototype.onClicked.bind(this);
}

//Abstract
/**
 * Конструктор заполненного элемента
 *
 * @param   int code    Код элемента
 */
var FilledElement = function(code) {
    Element.call(this, code);
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
    let result = new FilledElement(data.code);
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
    header.id = StrongString.HEADER + StrongString.SEPARATOR + this.code;
    let icon = document.createElement("img");
    icon.id = StrongString.FAVICON + StrongString.SEPARATOR + this.code;
    icon.src = this.icon;
    header.appendChild(icon);
    let caption = document.createElement("label");
    caption.className = "elementCaption";
    caption.id = StrongString.CAPTION + StrongString.SEPARATOR + this.code;
    if (!this.isCaptionHidden) {
        caption.textContent = this.caption;
    }
    header.appendChild(caption);
    let btn1 = document.createElement("img");
    btn1.className = "elementButton";
    btn1.src = "icons/refresh.svg";
    header.appendChild(btn1);
    btn1.onclick = function() {
        restoreElement(currPath, this.code);
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
        //TODO: подтвердить удаление
        let empty = new Element(this.code);
        overwriteElement(currPath, empty);
    }.bind(this);

    let df = Element.prototype.getInnerHtml.call(this);
    df.insertBefore(header, df.children[0]);
    let mture = df.getElementById(StrongString.MINIATURE +
            StrongString.SEPARATOR + this.code);
    return df;
}

/**
 * Конструктор элемента-закладки
 *
 * @param   int     code    Код элемента
 * @param   string  url     Ссылка
 */
var Bookmark = function(code, url) {
    FilledElement.call(this, code);
    this.type = ElementType.BOOKMARK;
    this.url = url || "https://google.com/"; //DEBUG
    this.miniature = null;
}
Bookmark.prototype = Object.create(FilledElement.prototype);
Bookmark.prototype.constructor = Bookmark;
/**
 * {@link Element.prototype.parseObj}
 */
Bookmark.prototype.parseObj = function(data) {
    let result = new Bookmark(data.code, data.url);
    //TOVERIFY
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
    newA.id = StrongString.ELEMENT + StrongString.SEPARATOR + this.code;
    newA.href = this.url;
    return newA;
}
/**
 * {@link Element.prototype.getInnerHtml}
 */
Bookmark.prototype.getInnerHtml = function () {
    let df = FilledElement.prototype.getInnerHtml.call(this);
    let a = document.createElement("a");
    a.href = this.url;
    a.appendChild(df);
    /*let mture = df.getElementById(StrongString.MINIATURE +
            StrongString.SEPARATOR + this.code);
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
    return a;
}

/**
 * Конструктор элемента-папки
 *
 * @param   int     code        Код элемента
 * @param   string  caption     Название папки
 * @param   int     rows        Количество строк (по умолчанию 3)
 * @param   int     cols        Количество столбцов (по умолчанию 3)
 * @param   BgType  bgtype      Тип фона (по умолчанию стандартный)
 * @param   string  bgdata      Данные фона (по умолчанию null)
 * @param   string  bgviewstr   Отображаемая строка вместо данных фона
 *                              (по умолчанию пуста)
 */
var Folder = function(code, caption, rows = 3, cols = 3, 
        bgtype = BgType.DEFAULT, bgdata = null, bgviewstr = "") {
    FilledElement.call(this, code);
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
    if (this.code > 0) {
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
    //TOVERIFY
    let result = new Folder(data.code, data.caption, data.rows, data.cols, data.bgtype, data.bgdata, data.bgviewstr);
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
    currPath.push(this.code);
    buildPage(this);
}
/**
 * {@link Element.prototype.getInnerHtml}
 */
Folder.prototype.getInnerHtml = function () {
    let df = FilledElement.prototype.getInnerHtml.call(this);
    
    if (!this.isMiniatureHidden) {
        let mture = df.getElementById(StrongString.MINIATURE +
                StrongString.SEPARATOR + this.code);
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
 * @param   int code    Код элемента
 */
var BackstepElement = function(code = 1) {
    Element.call(this, code);
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
    let label = df.getElementById(StrongString.CODE + StrongString.SEPARATOR + this.code);
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
 * Хранит последовательность кодов элементов-папок, которая
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
            let code = folder.cols * i + j + 1;
            cell.appendChild(Element.prototype.getInitHtml(code));
            //restoreElement(currPath, code);
            rebuildElement(folder.elements[code - 1]);
        }
    }

    /*Установка размера шрифта для кодов элементов*/
    let amount = folder.rows * folder.cols;
    let digits;
    for (digits = 0; amount > 1; ++digits) {
        amount /= 10;
    }
    //Множитель borderSize = (лишнийОтступСетки + границыЭлемента)
    let codeFontSizeH = "calc((100vw - var(--borderSize) * (1 + (1 + 1) * " + 
            folder.cols + ")) / " + folder.cols + " / " + digits + ")";
    let codeFontSizeV = "calc((100vh - var(--borderSize) * (1 + (4 + 1) * " + 
            folder.rows + ")) / " + folder.rows + ")";
    //document.documentElement.style.setProperty("--codeFontSize", "min(" + codeFontSizeH + "," + codeFontSizeV + ")"); //TODO: min() не используется в CSS3 - ref #4
    document.documentElement.style.setProperty("--codeFontSize", codeFontSizeV);
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
            StrongString.SEPARATOR + element.code);
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
 * @param   Element         element Код элемента
 * @param   AssignmentMode  mode    Режим назначения
 */
function showAssignmentForm(element, mode) {
    document.getElementById("assignmentForm").reset();
    document.getElementById("bgimgBase64").value = "";
    document.getElementById("bgimgPicker").required = true;
    document.getElementById("codeTf").value = element.code;

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
    //TODO: предупредить о потерях если пользователь сокращает размер сетки
    hideAssignmentForm();
    parseAssignmentForm().then(function (element) {
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
 * @return  Promise Возвращает Promise, который в случае успеха
 *          предоставляет объект со считанными свойствами элемента
 */
async function parseAssignmentForm() {
    let result = null;
    let code = parseInt(document.getElementById("codeTf").value);
    if (document.getElementById("bookmarkRb").checked) {
        let url = document.getElementById("urlTf").value;
        result = new Bookmark(code, url);
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
            //TODO: эффективно? см. также 2 функции ниже
            bgtype = BgType.IMAGE_LOCAL;
            const picker = document.getElementById("bgimgPicker");
            if (picker.files.length > 0) {
                let file = document.getElementById("bgimgPicker").files[0];
                let reader = new FileReader();
                reader.onloadend = function() {
                    isLocalImageLoading = false;
                }
                isLocalImageLoading = true;
                reader.readAsDataURL(file);
                await waitForLocalImage();
                bgdata = reader.result;
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
        result = new Folder(code, caption, rows, cols, bgtype, bgdata, bgviewstr);
    }

    result.isCaptionHidden = document.getElementById("hideCaptionChb").checked;
    result.isMiniatureHidden = document.getElementById("hideMiniatureChb").checked;
    return result;
}

let isLocalImageLoading;
async function waitForLocalImage() {
    while (isLocalImageLoading) {
        await sleep(30);
        console.log("Z-z-z");
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    folder.elements[element.code - 1] = element;

    /*let oldElement = document.getElementById(StrongString.ELEMENT + 
            StrongString.SEPARATOR + element.code);
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
 * Считывает элемент с заданным кодом из хранилища по заданному пути.
 * В случае, если путь совпадает с текущим, перестраивает
 * HTML-представление элемента на странице.
 *
 * @param   Array   path    Путь
 * @param   Element element Новый элемент
 */
function restoreElement(path, code) {
    browser.storage.local.get("structure").then(function(result) {
        let folder = getFolderByPath(path, result.structure);
        let element = folder.elements[code - 1];
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
