/*Представь, что это импорты*/

//import * as PhotonColors from './photon-colors.js';
const PhotonColors = {
    YELLOW_50: '#ffe900',
    PURPLE_50: '#9400ff',
    GREY_10: '#f9f9fa'
}

//import {ElementType} from './elements/Element.js';
const ElementType = {
    //Пустой
    EMPTY: 0,
    //Закладка
    BOOKMARK: 1,
    //Папка
    FOLDER: 2,
    //Шаг на уровень вверх
    BACKSTEP: 3
}
Object.freeze(ElementType);

//import {DEFAULT_BGCOLOR, BgType} from './elements/Folder.js';
const DEFAULT_BGCOLOR = PhotonColors.GREY_10;
const BgType = {
    //По умолчанию
    DEFAULT: 0,
    //Сплошной цвет
    SOLID: 1,
    //Изображение с компьютера
    IMAGE_LOCAL: 2,
    //Удалённое изображение
    IMAGE_REMOTE: 3
}
Object.freeze(BgType);
/*Импорты закончились*/

let inputMode = false;
let isPreviewShown = false;
let pathString;

let navCurtain = document.createElement("div");
navCurtain.id = "navCurtain";


let previewRect = document.createElement("div");
previewRect.id = "previewRect";

let addressLabel = document.createElement("label");
addressLabel.id = "addressLabel";

let miniature = document.createElement("div");
miniature.id = "miniature";

let iconPlusCaption = document.createElement("div");
iconPlusCaption.id = "iconPlusCaption";

let iconImg = document.createElement("img");
iconImg.id = "iconImg";

let captionLabel = document.createElement("label");
captionLabel.id = "captionLabel";

window.addEventListener("load", function() {
    let cssLink = document.createElement("link");
    cssLink.setAttribute("rel", "stylesheet");
    cssLink.setAttribute("type", "text/css");
    cssLink.setAttribute("href", browser.extension.getURL("kbd-navigation.css"));
    document.head.appendChild(cssLink);

    previewRect.appendChild(addressLabel);
    previewRect.appendChild(miniature);
    iconPlusCaption.appendChild(iconImg);
    iconPlusCaption.appendChild(captionLabel);
    previewRect.appendChild(iconPlusCaption);
    navCurtain.appendChild(previewRect);
    document.body.appendChild(navCurtain);
});

let rootFolder;

window.onkeydown = function(event) {
    if (event.key === "Control" && !inputMode) {
        browser.storage.local.get('structure').
                then(onStructureLoaded, onStructureLoadFailed);
        inputMode = true;
        pathString = "";
    }
}

window.onkeypress = function(event) {
    console.log(event);
    if (inputMode) {
        if (event.key === "Backspace" && pathString.length > 0) {
            pathString = pathString.substring(0, pathString.length - 1);
            addressLabel.textContent = pathString;
            if (pathString.length == 0) {
                switchNavUI(false);
            }
        } else {
            let newPathString = pathString +
                    (event.key === ' ' ? '/' : event.key);
            if (newPathString.
                    match(/^([1-9]\d{0,2}\/)*([1-9]\d{0,2}\/?)$/) !== null) {
                if (!isPreviewShown) {
                    switchNavUI(true);
                }
                pathString = newPathString;
                addressLabel.textContent = newPathString;
            }
        }
        let target = getElementByPath(pathString);
        fillPreview(target);
    }

    if (isPreviewShown) {
        event.preventDefault();
    }
}

window.onkeyup = function(event) {
    if (event.key === "Control") {
        inputMode = false;
        switchNavUI(false);
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
    console.log("results in onStructureLoaded:")
    console.log(results);
    console.log("-- onStructureLoaded end --");
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
    console.log("Structure Load Failed :(")
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
        success = folder && folder.type == ElementType.FOLDER;
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
        case (ElementType.FOLDER):
            if (element.isMiniatureHidden) {
                miniature.style.backgroundColor = PhotonColors.PURPLE_50;
                miniature.style.backgroundImage =
                        "url('" + browser.extension.getURL("icons/hidden-miniature-placeholder.svg") + "'')";
                miniature.style.backgroundSize = "200px";
            } else {
                switch (element.bgtype) {
                    case BgType.DEFAULT:
                        miniature.style.backgroundColor = DEFAULT_BGCOLOR;
                        miniature.style.backgroundImage = "";
                        break;
                    case BgType.SOLID:
                        miniature.style.backgroundColor = element.bgdata;
                        miniature.style.backgroundImage = "";
                        break;
                    case BgType.IMAGE_LOCAL:
                    case BgType.IMAGE_REMOTE:
                        miniature.style.backgroundColor = "";
                        miniature.style.backgroundImage =
                                "url('" + element.bgdata + "')";
                        break;
                }
                miniature.style.backgroundSize = "cover";
            }
            iconImg.src = element.icon;
            if (element.isCaptionHidden) {
                captionLabel.textContent = "";
            } else {
                captionLabel.textContent = element.caption +
                        " (" + element.cols + "x" + element.rows + ")";
            }
            break;
        case (ElementType.BOOKMARK):
            if (element.isMiniatureHidden) {
                miniature.style.backgroundColor = PhotonColors.PURPLE_50;
                miniature.style.backgroundImage =
                        "url('" + browser.extension.getURL("icons/hidden-miniature-placeholder.svg") + "')";
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
            miniature.style.backgroundImage = "url('" + browser.extension.getURL("icons/nothing-found.svg") + "')";
            miniature.style.backgroundSize = "150px";
            iconImg.src = "";
            captionLabel.textContent = browser.i18n.getMessage("elementIsNotFound");
            break;
    }
}
