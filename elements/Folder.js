import * as PhotonColors from '../photon-colors.js';
import * as StrongString from '../strong-string.js';

import {currPath, buildPage} from '../mlsd.js';

import {ElementType} from './Element.js';
import Element from './Element.js';
import FilledElement from './FilledElement.js';
import BackstepElement from './BackstepElement.js';

/**
 * Цвет фона по умолчанию
 *
 * @var string  DEFAULT_BGCOLOR
 */
export const DEFAULT_BGCOLOR = PhotonColors.GREY_10;

/**
 * enum Тип фона
 *
 * @var Object  BgType
 */
export const BgType = {
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

/**
 * Конструктор элемента-папки
 *
 * @param   int     number      Номер элемента
 * @param   string  caption     Название папки
 * @param   int     rows        Количество строк (по умолчанию 3)
 * @param   int     cols        Количество столбцов (по умолчанию 3)
 * @param   BgType  bgtype      Тип фона (по умолчанию стандартный)
 * @param   string  bgdata      Данные фона (по умолчанию null)
 * @param   string  bgviewstr   Отображаемая строка вместо данных фона
 *                              (по умолчанию пуста)
 */
var Folder = function(number, caption, rows = 3, cols = 3,
        bgtype = BgType.DEFAULT, bgdata = null, bgviewstr = "") {
    FilledElement.call(this, number);
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
    if (this.number > 0) {
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
export default Folder;

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
Folder.prototype.parseObj = function(data) {
    let result = new Folder(data.number, data.caption, data.rows, data.cols, data.bgtype, data.bgdata, data.bgviewstr);
    let superObj = FilledElement.prototype.parseObj.call(this, data);
    Object.assign(result, superObj);
    result.elements = data.elements;
    return result;
}

/**
 * Действие
 *
 * Реакция элемента на нажатие мыши
 * {@link Element.prototype.action}
 */
Folder.prototype.action = function() {
    //console.log("Здесь открывается папка");
    currPath.push(this.number);
    buildPage(this);
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
Folder.prototype.getInnerHtml = function () {
    let df = FilledElement.prototype.getInnerHtml.call(this);

    if (!this.isMiniatureHidden) {
        let mture = df.getElementById(StrongString.MINIATURE +
                StrongString.SEPARATOR + this.number);
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
