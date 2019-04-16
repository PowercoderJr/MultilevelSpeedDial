import * as Commands from './messaging-commands.js';
import * as PhotonColors from './photon-colors.js';
import * as ElementTypes from './elements/elementTypes.js';
import * as BgTypes from './elements/bgTypes.js';

import {DEFAULT_BGCOLOR} from './elements/defaultBgColor.js';
import {onSettingsLoaded} from './settings-reader.js';

/**
 * Флаг режима ввода
 *
 * @var boolean inputMode
 */
let inputMode = false;

/**
 * Флаг новой вкладки
 *
 * @var boolean isNewTabNeeded
 */
let isNewTabNeeded = false;

/**
 * Флаг отображения превью
 *
 * @var boolean isPreviewShown
 */
let isPreviewShown = false;

/**
 * Путь, введённый с клавиатуры
 *
 * @var string pathString
 */
let pathString;

/**
 * Элемент интерфейса при использовании сочетаний клавиш
 *
 * @var HTMLElement navCurtain
 */
let navCurtain = document.createElement("div");
navCurtain.id = "navCurtain";

/**
 * Элемент интерфейса при использовании сочетаний клавиш
 *
 * @var HTMLElement previewRect
 */

let previewRect = document.createElement("div");
previewRect.id = "previewRect";

/**
 * Элемент интерфейса при использовании сочетаний клавиш
 *
 * @var HTMLElement closeBtn
 */
let closeBtn = document.createElement("img");
closeBtn.id = "closeBtn";

/**
 * Элемент интерфейса при использовании сочетаний клавиш
 *
 * @var HTMLElement addressLabel
 */
let addressLabel = document.createElement("label");
addressLabel.id = "addressLabel";

/**
 * Элемент интерфейса при использовании сочетаний клавиш
 *
 * @var HTMLElement miniature
 */
let miniature = document.createElement("div");
miniature.id = "miniature";

/**
 * Элемент интерфейса при использовании сочетаний клавиш
 *
 * @var HTMLElement iconPlusCaption
 */
let iconPlusCaption = document.createElement("div");
iconPlusCaption.id = "iconPlusCaption";

/**
 * Элемент интерфейса при использовании сочетаний клавиш
 *
 * @var HTMLElement iconImg
 */
let iconImg = document.createElement("img");
iconImg.id = "iconImg";

/**
 * Элемент интерфейса при использовании сочетаний клавиш
 *
 * @var HTMLElement captionLabel
 */
let captionLabel = document.createElement("label");
captionLabel.id = "captionLabel";

/**
 * Элемент интерфейса при использовании сочетаний клавиш
 *
 * @var HTMLElement captionLabel
 */
let hints = document.createElement("label");
hints.id = "hints";
hints.style.display = "none";

/**
 * Флаг - инициализирован ли пользовательский интерфейс
 *
 * @var boolean  hasUiBeenInited
 */
let hasUiBeenInited = false;

/**
 * Корневая папка
 *
 * @var Folder  rootFolder
 */
let rootFolder;

/**
 * Элемент, к которому ведёт заданный пользователем путь
 *
 * @var Element target
 */
let target;

//console.log("Asking for...")
browser.storage.local.get('structure').
        then(onStructureLoaded, onStructureLoadFailed);

browser.storage.local.get(['settings']).then(function(results) {
    let settings = onSettingsLoaded(results);
    //console.log("Settings: ", settings)
    if (settings.kbdnavOn) {
        buildUI();
        setListeners();
    }
}, function(results) {
    console.log(results)
});
//console.log("Well asked")

/**
 * Построение объектов для отображения превью
 *
 * Собирает все объекты (фоновый div, label адреса, image для превью,
 * image для иконки), добавляет их на штору, а штору - на страницу.
 * Также подключает для них таблицы стилей. Устанавливает флаг hasUiBeenInited
 * {@link hasUiBeenInited}
 */
function buildUI() {
    /*let cssLink = document.createElement("link");
    cssLink.setAttribute("rel", "stylesheet");
    cssLink.setAttribute("type", "text/css");
    cssLink.setAttribute("href",
            browser.extension.getURL("kbd-navigation.css"));
    document.head.appendChild(cssLink);*/
    closeBtn.src = "data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
    previewRect.appendChild(closeBtn);
    previewRect.appendChild(addressLabel);
    previewRect.appendChild(miniature);
    iconPlusCaption.appendChild(iconImg);
    iconPlusCaption.appendChild(captionLabel);
    previewRect.appendChild(iconPlusCaption);
    previewRect.appendChild(hints);
    navCurtain.appendChild(previewRect);
    document.body.appendChild(navCurtain);

    hints.textContent = browser.i18n.getMessage("kbdNavHints");
    hints.innerHTML = hints.innerHTML.replace(/\n/g, "<br/>");

    hasUiBeenInited = true;
}

/**
 * Уничтожение объектов для отображения превью
 */
function destroyUI() {
    document.body.removeChild(navCurtain);
}

/**
 * Установка слушателей
 */
function setListeners() {
    window.addEventListener("keydown", onKeyDown);
    //window.addEventListener("keypress", onKeyPress);
    window.addEventListener("keyup", onKeyUp);

    closeBtn.onclick = function(event) {        
        unsetListeners();
        destroyUI();
    }
}

/**
 * Удаление слушателей
 */
function unsetListeners() {
    window.removeEventListener("keydown", onKeyDown);
    //window.removeEventListener("keypress", onKeyPress);
    window.removeEventListener("keyup", onKeyUp);
}

function onKeyDown(event) {
    //console.log(event)
    //console.log(inputMode)
    if (event.key === "Control" && !inputMode) {
        browser.storage.local.get('structure').
                then(onStructureLoaded, onStructureLoadFailed);
        inputMode = true;
        isNewTabNeeded = false;
        pathString = "";
        target = null;
    } else if (event.key === "Shift" && inputMode) {
        isNewTabNeeded = true;
    }

    /****************************onKeyPress****************************/
    //console.log('Cancelable?', event.cancelable)
    if (inputMode) {
        if (event.key === "Backspace" && pathString.length > 0) {
            pathString = pathString.substring(0, pathString.length - 1);
            addressLabel.textContent = pathString;
            if (pathString.length == 0) {
                switchNavUI(false);
            }
        } else {
            if ((event.key === "+" || event.key === "-") && isPreviewShown) {
                if (pathString[pathString.length - 1] === '/') {
                    pathString = pathString + "1";
                } else {
                    let slashIndex = pathString.lastIndexOf('/');
                    let pathTail = pathString.substring(0, slashIndex + 1);
                    let targetNumber = +pathString.substring(slashIndex + 1);
                    if (event.key === "+" && targetNumber < 999) {
                        pathString = pathTail + (targetNumber + 1);
                    } else if (event.key === "-" && targetNumber > 1) {
                        pathString = pathTail + (targetNumber - 1);
                    }
                }
            } else {
                const digitRegExp = /^(Digit|Numpad|)(\d)$/;
                let appendix;
                if (digitRegExp.test(event.code)) {
                    appendix = event.code.replace(digitRegExp, "$2")
                } else if (event.key === '/' || event.key === ' ') {
                    appendix = '/';
                } else {
                    appendix = null;
                }

                if (appendix !== null) {
                    let newPathString = pathString + appendix;
                    const pathRegExp = /^([1-9]\d{0,2}\/)*([1-9]\d{0,2}\/?)$/;
                    if (pathRegExp.test(newPathString)) {
                        if (!hasUiBeenInited) {
                            buildUI();
                        }
                        if (!isPreviewShown) {
                            //console.log("Okaaaay")
                            switchNavUI(true);
                        }
                        pathString = newPathString;
                        addressLabel.textContent = newPathString;
                    }
                }
            }
        }
        addressLabel.textContent = pathString;
        target = getElementByPath(pathString);
        fillPreview(target);
    }

    if (isPreviewShown) {
        event.preventDefault();
    }
    /*Конец onKeyPress*/
}

/*function onKeyPress(event) {
    console.log('Cancelable?', event.cancelable)
    if (inputMode) {
        if (event.key === "Backspace" && pathString.length > 0) {
            pathString = pathString.substring(0, pathString.length - 1);
            addressLabel.textContent = pathString;
            if (pathString.length == 0) {
                switchNavUI(false);
            }
        } else {
            if ((event.key === "+" || event.key === "-") && isPreviewShown) {
                if (pathString[pathString.length - 1] === '/') {
                    pathString = pathString + "1";
                } else {
                    let slashIndex = pathString.lastIndexOf('/');
                    let pathTail = pathString.substring(0, slashIndex + 1);
                    let targetNumber = +pathString.substring(slashIndex + 1);
                    if (event.key === "+" && targetNumber < 999) {
                        pathString = pathTail + (targetNumber + 1);
                    } else if (event.key === "-" && targetNumber > 1) {
                        pathString = pathTail + (targetNumber - 1);
                    }
                }
            } else {
                const digitRegExp = /^(Digit|Numpad|)(\d)$/;
                let appendix;
                if (digitRegExp.test(event.code)) {
                    appendix = event.code.replace(digitRegExp, "$2")
                } else if (event.key === '/' || event.key === ' ') {
                    appendix = '/';
                } else {
                    appendix = null;
                }

                if (appendix !== null) {
                    let newPathString = pathString + appendix;
                    const pathRegExp = /^([1-9]\d{0,2}\/)*([1-9]\d{0,2}\/?)$/;
                    if (pathRegExp.test(newPathString)) {
                        if (!hasUiBeenInited) {
                            buildUI();
                        }
                        if (!isPreviewShown) {
                            console.log("Okaaaay")
                            switchNavUI(true);
                        }
                        pathString = newPathString;
                        addressLabel.textContent = newPathString;
                    }
                }
            }
        }
        addressLabel.textContent = pathString;
        target = getElementByPath(pathString);
        fillPreview(target);
    }

    if (isPreviewShown) {
        event.preventDefault();
    }
}*/

function onKeyUp(event) {
    if (event.key === "Control" && inputMode) {
        inputMode = false;
        switchNavUI(false);

        if (target) {
            switch (target.type) {
                case ElementTypes.BOOKMARK:
                    browser.runtime.sendMessage({
                        command: Commands.GOTO_URL,
                        url: target.url,
                        newTab: isNewTabNeeded
                    });
                    break;
                case ElementTypes.FOLDER:
                    browser.runtime.sendMessage({
                        command: Commands.GOTO_FOLDER,
                        folder: target,
                        path: pathString,
                        newTab: isNewTabNeeded
                    });
                    break;
            }
        }
    }
}

/**
 * Отобразить/скрыть интерфейс навигации
 *
 * @param   boolean switch  True - отобразить, false - скрыть
 */
function switchNavUI(switch1) {
    if (switch1) {
        isPreviewShown = true;
        navCurtain.style.display = "flex";
        hints.style.display = "initial";
    } else {
        isPreviewShown = false;
        navCurtain.style.display = "none";
    }
}

/**
 * Проверка строки на число
 * 
 * @param   string  str Проверяемая строка
 * @return  boolean     Возвращает true, если проверяемая строка
 *                      содержала число, иначе возвращает false.
 */
function isNumber(str) {
    let trimmed = str.trim();
    return trimmed.length > 0 && !isNaN(trimmed);
}

/**
 * Получение данных о структуре закладок
 *
 * Выполняется при успешной операции чтения структуры элементов из
 * локального хранилища. Функция будет вызвана также в случае, если
 * структура не была найдена в хранилище. Тогда управление будет
 * передано в onStructureLoadFailed {@link buildPage}
 *
 * @param   mixed   results    Результат чтения
 */
function onStructureLoaded(results) {
    if (results.structure) {
        rootFolder = results.structure;
    } else {
        onStructureLoadFailed();
    }
}

/**
 * Обработчик ошибки при получении данных о структуре закладок
 *
 * @param   object  error   Детали
 */
function onStructureLoadFailed(error) {
    fillPreview({type: -1});
}

/**
 * Предоставление информации об элементе по заданному пути
 *
 * В случае, если путь задан корректно, предоставляет заголовок (caption),
 * иконку (icon) тип фона (bgtype), фон (bgdata) и тип (type) элемента. Если
 * элемент не найден, эти поля будут заполнены значениями, сигнализирующими
 * об ошибке.
 * 
 * @param   string  path    Путь
 * @return  mixed           Информация об элементе
 */
function getElementByPath(path) {
    if ((typeof path).toLowerCase() === "string") {
        path = path.split("/");
    }
    path = path.filter(item => item != "");

    let folder = rootFolder;
    let targetIndex = path[path.length - 1];
    path.pop();

    let success = true;
    for (let i = 0; success && i < path.length; ++i) {
        folder = folder.elements[path[i] - 1];
        success = folder && folder.type == ElementTypes.FOLDER;
    }

    let result = success ? folder.elements[targetIndex - 1] : {type: -1};
    return result ? result : {type: -1};
}

/**
 * Заполнение превью
 *
 * Заполняет элементы блока превью данными об элементе: заголовок, иконка,
 * карнитка-превью или цвет фона.
 *
 * @param   Element element Элемент
 */
function fillPreview(element) {
    switch (element.type) {
        case (ElementTypes.FOLDER):
            if (element.isMiniatureHidden) {
                miniature.style.backgroundColor = PhotonColors.PURPLE_50;
                miniature.style.backgroundImage =
                        "url('" + browser.extension.getURL(
                            "icons/hidden-miniature-placeholder.svg") + "')";
                miniature.style.backgroundSize = "200px";
            } else {
                switch (element.bgtype) {
                    case BgTypes.DEFAULT:
                        //miniature.style.backgroundColor = DEFAULT_BGCOLOR;
                        DEFAULT_BGCOLOR().then(function(result)
                        {
                            miniature.style.backgroundColor = result;
                        });
                        miniature.style.backgroundImage = "";
                        break;
                    case BgTypes.SOLID:
                        miniature.style.backgroundColor = element.bgdata;
                        miniature.style.backgroundImage = "";
                        break;
                    case BgTypes.IMAGE_LOCAL:
                    case BgTypes.IMAGE_REMOTE:
                        miniature.style.backgroundColor = "";
                        miniature.style.backgroundImage =
                                "url('" + element.bgdata + "')";
                        break;
                }
                miniature.style.backgroundSize = "cover";
            }
            iconImg.src = browser.extension.getURL("icons/folder.svg");
            if (element.isCaptionHidden) {
                captionLabel.textContent = "";
            } else {
                captionLabel.textContent = element.caption +
                        " (" + element.cols + "x" + element.rows + ")";
            }
            break;
        case (ElementTypes.BOOKMARK):
            if (element.isMiniatureHidden) {
                miniature.style.backgroundColor = PhotonColors.PURPLE_50;
                miniature.style.backgroundImage =
                        "url('" + browser.extension.getURL(
                            "icons/hidden-miniature-placeholder.svg") + "')";
                miniature.style.backgroundSize = "200px";
            } else {
                miniature.style.backgroundColor = "";
                miniature.style.backgroundImage = 
                        "url('" + element.miniature + "')";
                miniature.style.backgroundSize = "cover";
            }
            iconImg.src = element.icon;
            if (element.isCaptionHidden) {
                captionLabel.textContent = "";
            } else {
                captionLabel.textContent = element.caption;
            }
            break;
        default:
            miniature.style.backgroundColor = PhotonColors.YELLOW_50;
            miniature.style.backgroundImage = "url('" +
                    browser.extension.getURL(
                        "icons/nothing-found.svg") + "')";
            miniature.style.backgroundSize = "150px";
            iconImg.src = "";
            captionLabel.textContent = browser.i18n.
                    getMessage("elementIsNotFound");
            break;
    }
}
