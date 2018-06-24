import * as StrongString from '../strong-string.js';
import {verifyTarget, showAssignmentForm, AssignmentMode} from '../mlsd.js';

/**
 * enum Тип элемента
 *
 * @var Object  ElementType
 */
export const ElementType = {
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

/**
 * Конструктор Element
 *
 * @param   int number  Номер элемента
 */
var Element = function(number) {
    this.type = ElementType.EMPTY;
    this.number = number;
}
export default Element;

/**
 * Парсинг элемента
 *
 * Воссоздаёт объект элемента по заданному набору свойств
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

    //console.log("Target is ", event.target);
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
