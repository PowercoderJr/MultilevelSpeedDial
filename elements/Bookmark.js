import * as StrongString from '../strong-string.js';
import * as ElementTypes from './elementTypes.js';

import {overwriteElement, getPagePreviewInfo, onPromiseFailed,
    currPath} from '../mlsd.js';

import FilledElement from './FilledElement.js';

/**
 * Конструктор элемента-закладки
 *
 * @param   int     number  Номер элемента
 * @param   string  url     Ссылка
 */
var Bookmark = function(number, url) {
    FilledElement.call(this, number);
    this.type = ElementTypes.BOOKMARK;
    this.url = url;
    this.icon = null;
    this.caption = null;
    this.miniature = null;
}
Bookmark.prototype = Object.create(FilledElement.prototype);
Bookmark.prototype.constructor = Bookmark;
export default Bookmark;

/**
 * Парсинг элемента
 *
 * Воссоздаёт объект элемента по заданному набору свойств
 * {@link Element.prototype.parseObj}
 *
 * @param   mixed   data    Набор свойств
 * @return  Element         Возвращает новый объект
 *                          элемента с заданными свойствами
 */
Bookmark.prototype.parseObj = function(data) {
    let result = new Bookmark(data.number, data.url);
    let superObj = FilledElement.prototype.parseObj.call(this, data);
    Object.assign(result, superObj);
    result.miniature = data.miniature;
    return result;
}

/**
 * Действие
 *
 * Реакция элемента на нажатие мыши
 * {@link Element.prototype.action}
 */
Bookmark.prototype.action = function() {
    //console.log("Здесь открывается закладка");
}

/**
 * Инициализация HTML-разметки
 *
 * Создаёт контейнер для элемента
 * {@link Element.prototype.getInitHtml}
 *
 * @param   int         number  Номер элемента
 * @return  HTMLElement         Возвращает контейнер
 *                              в виде HTML-элемента
 */
Bookmark.prototype.getInitHtml = function() {
    let newA = document.createElement("a");
    newA.className = "element";
    newA.id = StrongString.ELEMENT + StrongString.SEPARATOR + this.number;
    newA.href = this.url;
    newA.draggable = "true";
    return newA;
}

/**
 * Генерация тела HTML-блока
 *
 * Генерирует тело HTML-блока на основе имеющихся свойств
 * {@link Element.prototype.getInnerHtml}
 *
 * @return  DocumentFragment    Возвращает объект документа,
 *                              сгенерированный в соответствии с
 *                              типом элемента
 */
Bookmark.prototype.getInnerHtml = function () {
    let df = FilledElement.prototype.getInnerHtml.call(this);

    let header = df.getElementById(StrongString.HEADER +
            StrongString.SEPARATOR + this.number)
    let editBtn = df.getElementById(StrongString.EDIT_BTN +
            StrongString.SEPARATOR + this.number)

    let rdBtn = document.createElement("img");
    rdBtn.className = "elementButton";
    rdBtn.id = StrongString.REFRESH_DELAYED_BTN +
            StrongString.SEPARATOR + this.number;
    rdBtn.src = "icons/refresh-delayed.svg";
    header.insertBefore(rdBtn, editBtn);
    rdBtn.onclick = function() {
        this.refresh(3000, true);
    }.bind(this);

    if (!this.isCaptionHidden) {
        df.getElementById(StrongString.CAPTION +
                StrongString.SEPARATOR + this.number).
                textContent = this.caption;
    }
    df.getElementById(StrongString.FAVICON +
            StrongString.SEPARATOR + this.number).src = this.icon;
    if (!this.isMiniatureHidden) {
        df.getElementById(StrongString.MINIATURE +
                StrongString.SEPARATOR + this.number).style.
                backgroundImage = "url('" + this.miniature + "')";
    }
    return df;
}

/**
 * Обновление элемента
 *
 * {@link FilledElement.prototype.refresh}
 */
Bookmark.prototype.refresh = function(delay, isToDisplay) {
    let folderPath = Array.from(currPath);

    document.getElementById(StrongString.NUMBER +
            StrongString.SEPARATOR + this.number).
            textContent = "...";

    FilledElement.prototype.refresh.call(this);
    getPagePreviewInfo(this.url, delay, isToDisplay).then(function(data) {
        this.caption = data.title || this.caption;
        this.icon = data.favicon || this.icon;
        this.miniature = data.screenshot || this.miniature;
        overwriteElement(folderPath, this);
    }.bind(this), onPromiseFailed).then(function() {
        document.getElementById(StrongString.NUMBER +
                StrongString.SEPARATOR + this.number).
                textContent = this.number;
    }.bind(this));
}
