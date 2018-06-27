import * as StrongString from '../strong-string.js';
import {overwriteElement, getPagePreviewInfo, onPromiseFailed,
    currPath} from '../mlsd.js';

import {ElementType} from './Element.js';
import FilledElement from './FilledElement.js';

/**
 * Конструктор элемента-закладки
 *
 * @param   int     number  Номер элемента
 * @param   string  url     Ссылка
 */
var Bookmark = function(number, url) {
    FilledElement.call(this, number);
    this.type = ElementType.BOOKMARK;
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
    console.log("Здесь открывается закладка");
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
Bookmark.prototype.refresh = function() {
    document.getElementById(StrongString.NUMBER +
            StrongString.SEPARATOR + this.number).
            textContent = "...";

    FilledElement.prototype.refresh.call(this);
    getPagePreviewInfo(this.url).then(function(data) {
        this.caption = data.title;
        this.icon = data.favicon;
        this.miniature = data.screenshot;
        overwriteElement(currPath, this);
        //getFolderByPath(currPath).elements[this.number - 1] = this;
        //rebuildElement(this);
    }.bind(this), onPromiseFailed). then(function() {
        document.getElementById(StrongString.NUMBER +
                StrongString.SEPARATOR + this.number).
                textContent = this.number;
    }.bind(this));
}
