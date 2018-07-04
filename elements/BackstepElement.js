import * as StrongString from '../strong-string.js';
import {currPath, buildPage, getFolderByPath} from '../mlsd.js';

import {ElementType} from './Element.js';
import Element from './Element.js';

/**
 * Конструктор элемента "Шаг назад"
 *
 * @param   int number  Номер элемента
 */
var BackstepElement = function(number) {
    Element.call(this, number);
    this.type = ElementType.BACKSTEP;
}
BackstepElement.prototype = Object.create(Element.prototype);
BackstepElement.prototype.constructor = BackstepElement;
export default BackstepElement;

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
BackstepElement.prototype.parseObj = function(data) {
    return new BackstepElement(data.number);
}

/**
 * Действие
 *
 * Реакция элемента на нажатие мыши
 * {@link Element.prototype.action}
 */
BackstepElement.prototype.action = function() {
    //console.log("Здесь открывается предыдущая папка");
    currPath.pop();
    buildPage(getFolderByPath(currPath));
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
BackstepElement.prototype.getInnerHtml = function () {
    let df = Element.prototype.getInnerHtml.call(this);
    let label = df.getElementById(StrongString.NUMBER + StrongString.SEPARATOR + this.number);
    label.textContent = "←";
    return df;
}
