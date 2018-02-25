/*Описание прототипов*/
//Драсти
/*Окончание описания прототипов*/

window.onload = function() {
    buildPage(3, 3, 0, 0);
}

const bgTypes = {
    DEFAULT: 0,
    SOLID: 1,
    IMAGE: 2
}
Object.freeze(bgTypes);

function buildPage(width, height, bgtype, bgdata) {
    bgtype = bgTypes.IMAGE;
    bgdata = "https://pp.userapi.com/c621515/v621515823/7470c/gUhs_I6VmrM.jpg";

    var bg;
    switch (bgtype) {
        case bgTypes.DEFAULT:
            bg = 'bgcolor="#F9F9FA"';
            break;
        case bgTypes.SOLID:
            bg = 'bgcolor="' + bgdata + '"';
            break;
        case bgTypes.IMAGE:
            bg = 'background="' + bgdata + '"';
            break;
    }

    var newBody = '<body ' + bg + '>\n\t<table cellspacing="10px">\n';
    for (i = 0; i < height; ++i) {
        newBody = newBody + '<tr>\n';
        for (j = 0; j < width; ++j) {
            newBody = newBody + '\t<td>\n';
            newBody = newBody + '\t\t' + buildHtmlElement(i, j) + '\n';
            newBody = newBody + '\t</td>\n';
        }
        newBody = newBody + '</tr>\n';
    }

    replaceBody(newBody);
}

function buildHtmlElement(x, y) {
    var code = '<div class="element" id="el_' + x + '_' + y + '">' +
	        '<div class="elementHeader"><img src="http://google.com/favicon.ico">' +
	        '<label class="elementCaption" id="caption_' + x + '_' + y + '">' +
	        'Подпись подпись подпись подпись подпись подпись подпись подпись подпись подпись</label>' +
	        '<img class="elementButton" src="icons/refresh.png">' +
	        '<img class="elementButton" src="icons/edit.png">' +
	        '<img class="elementButton" src="icons/delete.png"></div></div>';
    return code;
}

function replaceBody(newBody) {
    document.body.parentNode.innerHTML = '<!DOCTYPE html>\n<html>\n\n<head>\n\t' +
	        '<meta charset="UTF-8">\n\t<title>Multilevel Speed Dial</title>\n\t' +
	        '<link rel="stylesheet" type="text/css" href="style.css">\n\t' +
	        '<script type="text/javascript" src="mlsd.js"></script>\n</head>\n' +
	        newBody + '\n</html>\n';
}
