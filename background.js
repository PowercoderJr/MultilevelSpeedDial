/*Представь, что это импорты*/

//import {Commands} from './mlsd.js';
const Commands = {
    GOTO_URL: 0,
    GOTO_FOLDER: 1,
    BUILD_FOLDER_PAGE: 2
}
Object.freeze(Commands);
/*Импорты закончились*/

browser.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    switch (msg.command) {
        case Commands.GOTO_URL:
            if (msg.newTab) {
                browser.tabs.create({
                    url: msg.url,
                    openerTabId: sender.tab.id
                });
            } else {
                browser.tabs.update(sender.tab.id, {
                    url: msg.url
                });
            }
            break;
        case Commands.GOTO_FOLDER:
            if (msg.newTab) {
                browser.tabs.create({
                    url: browser.extension.getURL("mlsd.html"),
                    openerTabId: sender.tab.id
                }).then(function(tab) {
                    sendBuldPageCommand(tab, msg.folder, msg.path);
                });
            } else {
                browser.tabs.update(sender.tab.id, {
                    url: browser.extension.getURL("mlsd.html")
                }).then(function(tab) {
                    sendBuldPageCommand(tab, msg.folder, msg.path);
                });
            }
            break;
    }
});

/**
 * Отправка команды перехода в папку
 *
 * Посылает сообщение с элементом папки и новым путём, которое в дальнейшем
 * будет получено вкладкой с Mlsd. Там обработчик onMessage сообщения
 */
function sendBuldPageCommand(tab, folder, path) {
    let handledOnce = false;
    let onMlsdsTabCompleted = function(tabId, changeInfo, tabInfo) {
        if (!handledOnce && tabId == tab.id && changeInfo.status
                && changeInfo.status == "complete") {
            handledOnce = true;
            browser.tabs.sendMessage(tab.id, {
                command: Commands.BUILD_FOLDER_PAGE,
                folder: folder,
                path: path
            });
            browser.tabs.onUpdated.removeListener(onMlsdsTabCompleted);
        }
    }
    browser.tabs.onUpdated.addListener(onMlsdsTabCompleted);
}
