import * as StrongString from '../strong-string.js';
import {currPath, restoreElement, showAssignmentForm,
    AssignmentMode, overwriteElement} from '../mlsd.js';

import Element from './Element.js';

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
export default FilledElement;

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
FilledElement.prototype.parseObj = function(data) {
    let result = new FilledElement(data.number);
    let superObj = Element.prototype.parseObj.call(this, data);
    Object.assign(result, superObj);
    result.type = data.type;
    result.caption = data.caption;
    result.icon = data.icon;
    result.isCaptionHidden = data.isCaptionHidden;
    result.isMiniatureHidden = data.isMiniatureHidden;

    return result;
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
        this.refresh();
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
 * Обновление элемента
 */
FilledElement.prototype.refresh = function() {
    restoreElement(currPath, this.number);
}
