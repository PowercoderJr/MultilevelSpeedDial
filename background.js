import * as Commands from './messaging-commands.js';

import {onSettingsLoaded} from './settings-reader.js';

let settings;
browser.storage.local.get(['settings']).then(function(results) {
    settings = onSettingsLoaded(results);
});

browser.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName == "local" && changes.settings) {
        settings = changes.settings.newValue;
    }
});

browser.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    switch (msg.command) {
        case Commands.GOTO_URL:
            if (msg.newTab) {
                browser.tabs.create({
                    url: msg.url,
                    active: settings.newTabActive,
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
                    active: settings.newTabActive,
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
 *
 * @param   Tab     tab     Вкладка-получатель
 * @param   Folder  folder  Объект папки, которая будет открыта
 * @param   Array   path    Путь к папке, которая будет открыта
 */
function sendBuldPageCommand(tab, folder, path) {
    let handledOnce = false;
    let onMlsdTabCompleted = function(tabId, changeInfo, tabInfo) {
        if (!handledOnce && tabId == tab.id && changeInfo.status
                && changeInfo.status == "complete") {
            handledOnce = true;
            browser.tabs.sendMessage(tab.id, {
                command: Commands.BUILD_FOLDER_PAGE,
                folder: folder,
                path: path
            });
            browser.tabs.onUpdated.removeListener(onMlsdTabCompleted);
        }
    }
    browser.tabs.onUpdated.addListener(onMlsdTabCompleted);
}

/**
 * Индексы вкладок, которые нужно закрыть
 *
 * Используется при включённой опции "фокус на страницу на новой вкладке".
 * В массив помещаются идексы вкладок, которые не имеют openerTabId (а значит,
 * открыты кнопкой "+" на заголовке или комбинацией Ctrl+T). Как только станет
 * известен адрес страницы, выполнится проверка на совпадение с mlsd.html, и
 * в случае успеха вкладка будет закрыта, а вместо неё открыта такая же новая.
 * Фишка в том, что вкладки, открытые способами, описанными выше, имеют фокус
 * на адресной строке, а открытые из кода - на странице. Ура, костыль!
 *
 * @var Array   tabIndicesToRemove
 */
let tabIndicesToRemove = [];

browser.tabs.onCreated.addListener(function(tab) {
    let openerTabId = tab.openerTabId;
    if (settings.doPageFocus && !tab.openerTabId) {
        tabIndicesToRemove.push(tab.id);
    }
});

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tabIndicesToRemove.indexOf(tabId) >= 0 && changeInfo.url &&
            changeInfo.url == browser.extension.getURL("mlsd.html")) {
        tabIndicesToRemove.splice(tabIndicesToRemove.indexOf(tabId), 1);
        browser.tabs.create({
            url: tab.url,
            openerTabId: tab.id
        }).then(function(newTab) {
            browser.tabs.remove(tab.id);
        });
    }
});
