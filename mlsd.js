import * as PhotonColors from './photon-colors.js';
import * as StrongString from './strong-string.js';

import {ElementType} from './elements/Element.js';
import Element from './elements/Element.js';
import Bookmark from './elements/Bookmark.js';
import {BgType} from './elements/Folder.js';
import Folder from './elements/Folder.js';
import BackstepElement from './elements/BackstepElement.js';

/**
 * enum Режим назначения элемента
 *
 * @var Object  AssignmentMode
 */
export const AssignmentMode = {
    //Создание
    CREATE: 0,
    //Редактирование
    EDIT: 1
}
Object.freeze(AssignmentMode);

/**
 * enum Парсер элемента
 *
 * @var Object ElementFactoryByType
 */
export const ElementFactoryByType = {
    [ElementType.EMPTY]: Element.prototype.parseObj,
    [ElementType.BOOKMARK]: Bookmark.prototype.parseObj,
    [ElementType.FOLDER]: Folder.prototype.parseObj,
    [ElementType.BACKSTEP]: BackstepElement.prototype.parseObj
}
Object.freeze(ElementFactoryByType);

/**
 * Цвет фона по умолчанию
 *
 * @var string  DEFAULT_BGCOLOR
 */
export const DEFAULT_BGCOLOR = PhotonColors.GREY_10;

/**
 * Текущий путь
 *
 * Хранит последовательность номеров элементов-папок, которая
 * ведёт от корневой папки к текущей
 *
 * @var Stack   currPath
 */
export let currPath = [];

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
    browser.storage.local.get().then(function(all) { //DEBUG
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
export function onPromiseFailed(error) {
    console.log(browser.i18n.getMessage("errMsg") + ": " + error);
}

/**
 * Построение страницы папки
 *
 * Генерирует и отображает страницу на основе объекта папки
 *
 * @param   Folder  folder  Элемент-папка
 */
export function buildPage(folder) {
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
        //TODO?: возможно ли перенести в CSS?
        let numberHTML = document.getElementById(StrongString.NUMBER
                + StrongString.SEPARATOR + "1");
        let numberFontSize = Math.min(numberHTML.offsetWidth * 0.9 / digits,
                numberHTML.offsetHeight);
        document.documentElement.style.setProperty("--numberFontSize",
                numberFontSize + "px");
        //console.log(document.getElementById("assignmentForm"));

        scaleAssignmentForm();
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
export function verifyTarget(event, allowedTargets) {
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
export function showAssignmentForm(element, mode) {
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
    scaleAssignmentForm();
}

/**
 * Масштабирование формы назначения элемента
 *
 * Проверяет, умещается ли форма назначения элемента в окно. При необходимости
 * уменьшает или увеличивает её. Показатель масштабирования находится в
 * диапазоне от 75% до 100%.
 */
 function scaleAssignmentForm() {
    let afContainer = document.getElementById("assignmentFormContainer");
    const afMinScale = 0.75;
    const afMaxScale = 1;
    let afScale = Math.min(window.innerWidth / (afContainer.offsetWidth + 8),
            window.innerHeight / (afContainer.offsetHeight + 8));
    if (afScale > afMaxScale) {
        afScale = afMaxScale;
    } else if (afScale < afMinScale) {
        afScale = afMinScale;
    }
    document.documentElement.style.setProperty("--assignmentFormScale",
            afScale);
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
function submitAssignmentForm(event) {
    event.preventDefault();
    //TODO: parseAssignmentForm(>true<), если режим - редактирование
    hideAssignmentForm();
    parseAssignmentForm(true).then(function (element) {
        console.log(element);
        overwriteElement(currPath, element);
        if (element instanceof Bookmark) {
            element.refresh();
        }
    });
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
            if (resolve && reader.result) {
                resolve(reader.result);
            } else if (reject) {
                reject(browser.i18n.getMessage("unableToLoadImg"));
            }
        }
        reader.readAsDataURL(file);
    });
}

/**
 * Получение информации об удалённой странице для превью
 *
 * Открывает url в новой вкладке, дожидается загрузки
 * страницы и записывает её название (title),
 *
 * @param   boolean copyElems   Копировать ли в новый объект структуру элементов
 *                              (актуально, если редактируется элемент-папка)
 * @return  Promise             Возвращает Promise, который в случае успеха
 *                              предоставляет объект со считанными свойствами элемента
 */
export function getPagePreviewInfo(url) {
    return new Promise((resolve, reject) => {
        let result;
        browser.tabs.create({url: url, active: false}).then(function(tab) {
            //TODO: hide() на данный момент является эксперементальной функцией, стоит ли дождаться релиза?
            //browser.tabs.hide(tab.id);
            let handler = function(tabId, changeInfo, tabInfo) {
                if (tabId == tab.id && changeInfo.status && changeInfo.status == "complete") {
                    browser.tabs.get(tabId).then(function(updatedTab) {
                        browser.tabs.captureTab(updatedTab.id).then(function(base64img) {
                            //TODO: передавать иконку в виде строки base64
                            resolve({title: updatedTab.title, favicon: updatedTab.favIconUrl, screenshot: base64img});
                            browser.tabs.remove(updatedTab.id);
                            browser.tabs.onUpdated.removeListener(handler);
                        }, reject);
                    }, reject);
                }
            }
            browser.tabs.onUpdated.addListener(handler);
        }, reject);
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
export function overwriteElement(path, element) {
    let folder = getFolderByPath(path, rootFolder);
    //WARN: element = verifyElementObject(element);
    folder.elements[element.number - 1] = element;
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
export function restoreElement(path, number) {
    browser.storage.local.get("structure").then(function(result) {
        let folder = getFolderByPath(path, result.structure);
        let element = folder.elements[number - 1];

        let folderFromStructure = getFolderByPath(path, rootFolder);
        //WARN: element = verifyElementObject(element);
        folderFromStructure.elements[element.number - 1] = element;

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
export function getFolderByPath(path, startDir) {
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
