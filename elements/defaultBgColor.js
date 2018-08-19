import {GREY_10, GREY_70} from '../photon-colors.js';

/*Цвет фона по умолчанию*/
export const DEFAULT_BGCOLOR_LIGHT = GREY_10;
export const DEFAULT_BGCOLOR_DARK = GREY_70;

export async function DEFAULT_BGCOLOR() {
	let result;
	await browser.storage.local.get(['settings']).then(function(results) {
        if (results.settings) {
        	result = results.settings.darkTheme ?
					DEFAULT_BGCOLOR_DARK : DEFAULT_BGCOLOR_LIGHT;
        }
    });
    return result;
}
