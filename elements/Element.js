import * as StrongString from '../strong-string.js';
import {verifyTarget, showAssignmentForm, AssignmentMode, currPath,
    swapElements, buildPage, ElementFactoryByType} from '../mlsd.js';

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
    newDiv.draggable = "true";
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
    let htmlElement = document.getElementById(StrongString.ELEMENT 
            + StrongString.SEPARATOR + this.number);
    htmlElement.onclick = Element.prototype.onClicked.bind(this);
    htmlElement.ondragstart = Element.prototype.onDragStart.bind(this);
    htmlElement.ondragenter = Element.prototype.onDragEnter.bind(this);
    htmlElement.ondragleave = Element.prototype.onDragLeave.bind(this);
    htmlElement.ondragover = Element.prototype.onDragOver.bind(this);
    htmlElement.ondrop = Element.prototype.onDrop.bind(this);
}

let dragEnterTime;
let counter;
let isOverDropTarget;

Element.prototype.onDragStart = function(event) {
    if (this.type != ElementType.EMPTY && this.type != ElementType.BACKSTEP) {
        let dndSrc = Array.from(currPath);
        dndSrc.push(this.number);
        event.dataTransfer.setData("srcPath", JSON.stringify(dndSrc));
        event.dataTransfer.setData("", JSON.stringify(dndSrc));
        event.dataTransfer.effectAllowed = "move";
        isOverDropTarget = false;
        counter = 0;
    }
}

Element.prototype.onDragEnter = function(event) {
    event.preventDefault();
    ++counter;

    let currElementPath = Array.from(currPath);
    currElementPath.push(this.number);
    let srcPath = JSON.parse(event.dataTransfer.getData("srcPath"));

    let isDragTarget = arraysEqual(currElementPath, srcPath);
    let isDropTarget;
    if (!isOverDropTarget && !isDragTarget) {
        let date = new Date();
        dragEnterTime = date.getTime();
        isOverDropTarget = true;
        event.currentTarget.style.borderStyle = "dashed";
    }
}

Element.prototype.onDragLeave = function(event) {
    event.preventDefault();
    --counter;

    if (counter == 0) {
        isOverDropTarget = false;
        event.currentTarget.style.borderStyle = "solid";
    }
}

Element.prototype.onDragOver = function(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    let currElementPath = Array.from(currPath);
    currElementPath.push(this.number);
    let srcPath = JSON.parse(event.dataTransfer.getData("srcPath"));

    let isDragTarget = arraysEqual(currElementPath, srcPath);

    if (!isDragTarget &&
            (this.type == ElementType.BACKSTEP ||
            this.type == ElementType.FOLDER)) {
        let date = new Date();
        if (date.getTime() - dragEnterTime > 1000) {
            let trueObj = ElementFactoryByType[this.type](this);
            trueObj.action();
            counter = 0;
        }
    }
}

Element.prototype.onDrop = function(event) {
    event.preventDefault();

    let currElementPathStr = Array.from(currPath);
    currElementPathStr.push(this.number);
    currElementPathStr = currElementPathStr.join("/");
    let srcPath = JSON.parse(event.dataTransfer.getData("srcPath"));
    let srcPathStr = srcPath.join("/");

    let isLoopDetected = srcPathStr.startsWith(currElementPathStr);

    if (this.type != ElementType.BACKSTEP && !isLoopDetected) {
        let dstPath = Array.from(currPath);
        dstPath.push(this.number);

        swapElements(srcPath, dstPath);
    } else {
        event.currentTarget.style.borderStyle = "solid";
        alert(browser.i18n.getMessage("ohnonono"));
    }
}

/**
 * Проверка на равенство двух массивов
 *
 * @param   Array   arr1    Первый массив
 * @param   Array   arr2    Второй массив
 */
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; ++i) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}
