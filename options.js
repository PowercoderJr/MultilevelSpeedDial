import {initFolderForm, onPromiseFailed, readFile, remoteImageToBase64}
    from './mlsd.js';
import {BgType, DEFAULT_BGCOLOR} from './elements/Folder.js';
import Folder from './elements/Folder.js';

/**
 * Корневая папка
 *
 * @var Folder  rootFolder
 */
var rootFolder;

/**
 * Настройки
 *
 * Содержит информацию о пользовательских настройках расширения
 *
 * @var Object  settings
 */
let settings;

window.onload = function() {
    document.getElementById("rootFolderSettingsLabel").textContent = browser.i18n.getMessage("rootFolderSettings");
    document.getElementById("rootFolderSettingsDescLabel").textContent = browser.i18n.getMessage("rootFolderSettingsDesc");
    document.getElementById("rootFolderSettingsDescLabel").innerHTML = document.getElementById("rootFolderSettingsDescLabel").innerHTML.replace(/\n/g, "<br/>");
    document.getElementById("okBtn").value = browser.i18n.getMessage("save");
    document.getElementById("restoreBtn").value = browser.i18n.getMessage("restore");
    document.getElementById("newTabFocusSettingsDescLabel").textContent = browser.i18n.getMessage("newTabFocusSettingsDesc");
    document.getElementById("newTabFocusSettingsDescLabel").innerHTML = document.getElementById("newTabFocusSettingsDescLabel").innerHTML.replace(/\n/g, "<br/>");
    document.getElementById("focusPageLabel").innerHTML += browser.i18n.getMessage("focusPage");
    document.getElementById("focusAddressBarLabel").innerHTML += browser.i18n.getMessage("focusAddressBar");
    document.getElementById("newTabFocusSettingsLabel").textContent = browser.i18n.getMessage("newTabFocusSettings");
    browser.storage.local.get(['structure', 'settings']).then(function(results) {
        onStructureLoaded(results);
        initFolderForm(rootFolder);
        refillRootFolderForm();
        onSettingsLoaded(results);
        refillNewTabFocusForm();
    }, onPromiseFailed);

    document.getElementById("folderSettingsForm").onsubmit = function(event) {
        event.preventDefault();
        browser.storage.local.get('structure').then(function(results) {
            onStructureLoaded(results);
            saveFolderSettings().then(function() {
                refillRootFolderForm();
            }, onPromiseFailed);
        }, onPromiseFailed);
    }

    document.getElementById("restoreBtn").onclick = function(event) {
        if (confirm(browser.i18n.getMessage("rlyRestoreRootFolderForm"))) {
            browser.storage.local.get('structure').then(function(results) {
                refillRootFolderForm();
            }, onPromiseFailed);
        }
    }

    let onNewTabFocusParamChanged = function () {
        browser.storage.local.get('settings').then(function(results) {
            onSettingsLoaded(results);
            settings.doPageFocus =
                    document.getElementById("focusPageRb").checked;
            browser.storage.local.set({settings});
        }, onPromiseFailed);
    }
    let bufControls = document.getElementsByName("newPageFocus");
    bufControls.forEach(function(item) {
        item.oninput = onNewTabFocusParamChanged;
    }, onPromiseFailed);
}

function onStructureLoaded(results) {
    if (results.structure) {
        rootFolder = results.structure;
    } else {
        rootFolder = new Folder(-1, browser.i18n.getMessage("extensionName"));
        let structure = rootFolder;
        browser.storage.local.set({structure});
    }
}

function onSettingsLoaded(results) {
    if (results.settings) {
        settings = results.settings;
    } else {
        settings = {
            doPageFocus: true
        }
        browser.storage.local.set({settings});
    }
}

/**
 * Заполнение формы настроек корневой папки текущими значениями
 */
function refillRootFolderForm() {
    document.getElementById("bgimgBase64").value = "";
    document.getElementById("bgimgPicker").required = true;
    document.getElementById("elemsWillBeLostLabel").textContent = "";
    document.getElementById("elemsWillBeLostLabel").style.display = "none";
    document.getElementById("imgLocalBgSpinner").style.display = "none";

    document.getElementById("rowsSpin").value = rootFolder.rows;
    document.getElementById("colsSpin").value = rootFolder.cols;
    document.getElementById("rowsOld").value = rootFolder.rows;
    document.getElementById("colsOld").value = rootFolder.cols;
    document.getElementById("defaultBgRb").checked = rootFolder.bgtype == BgType.DEFAULT;
    document.getElementById("bgcolorPicker").disabled = !(document.getElementById("colorBgRb").checked = rootFolder.bgtype == BgType.SOLID);
    document.getElementById("bgimgPicker").disabled = !(document.getElementById("imgLocalBgRb").checked = rootFolder.bgtype == BgType.IMAGE_LOCAL);
    document.getElementById("bgimgUrlTf").disabled = !(document.getElementById("imgRemoteBgRb").checked = rootFolder.bgtype == BgType.IMAGE_REMOTE);
    switch (rootFolder.bgtype) {
        case (BgType.SOLID):
            document.getElementById("bgcolorPicker").value = rootFolder.bgdata;
            break;
        case (BgType.IMAGE_LOCAL):
            if (rootFolder.bgviewstr.length == 0) {
                document.getElementById("bgimgPicker").required = true;
                document.getElementById("bgimgBase64").value = "";
            } else {
                //TODO: отобразить имя файла, если он был указан ранее https://stackoverflow.com/a/17949302
                //document.getElementById("bgimgPicker").value = rootFolder.bgviewstr; //SecurityError: The operation is insecure
                document.getElementById("bgimgPicker").required = false;
                document.getElementById("bgimgBase64").value = rootFolder.bgdata;
            }
            break;
        case (BgType.IMAGE_REMOTE):
            if (rootFolder.bgviewstr.length == 0) {
                document.getElementById("bgimgUrlTf").value = "";
                document.getElementById("bgimgUrlTf").required = true;
                document.getElementById("bgimgBase64").value = "";
            } else {
                document.getElementById("bgimgUrlTf").value = rootFolder.bgviewstr;
                document.getElementById("bgimgUrlTf").required = false;
                document.getElementById("bgimgBase64").value = rootFolder.bgdata;
            }
            break;
    }
}

/**
 * Заполнение формы настроек фокуса на новой вкладке
 */
function refillNewTabFocusForm() {
    document.getElementById("focusAddressBarRb").checked =
            !(document.getElementById("focusPageRb").checked =
            settings.doPageFocus);
}

/**
 * Сохранение настроек корневой папки
 *
 * Считывает информацию с формы корневой папки и записывает её в storage
 */
async function saveFolderSettings() {

    let rows = parseInt(document.getElementById("rowsSpin").value);
    let cols = parseInt(document.getElementById("colsSpin").value);

    let bgtype, bgdata, bgviewstr;
    if (document.getElementById("defaultBgRb").checked) {
        bgtype = BgType.DEFAULT;
        bgdata = null;
        bgviewstr = "";
    }
    else if (document.getElementById("colorBgRb").checked) {
        bgtype = BgType.SOLID;
        bgdata = document.getElementById("bgcolorPicker").value;
        bgviewstr = "";
    }
    else if (document.getElementById("imgLocalBgRb").checked) {
        bgtype = BgType.IMAGE_LOCAL;
        const picker = document.getElementById("bgimgPicker");
        if (picker.files.length > 0) {
            let file = picker.files[0];
            document.getElementById("imgLocalBgSpinner").style.display = "initial";
            await readFile(file).then(function(data) {bgdata = data;},
                    onPromiseFailed);
            bgviewstr = picker.files[0].name;
        } else {
            bgdata = document.getElementById("bgimgBase64").value;
            bgviewstr = "Какой-то файл.жыпэг";
        }
    }
    else if (document.getElementById("imgRemoteBgRb").checked) {
        bgtype = BgType.IMAGE_REMOTE;
        await remoteImageToBase64(document.getElementById("bgimgUrlTf").value).
                then(function(data) {bgdata = data;}, onPromiseFailed);
        bgviewstr = document.getElementById("bgimgUrlTf").value;
    }

    let result = new Folder(-1, browser.i18n.getMessage("extensionName"),
            rows, cols, bgtype, bgdata, bgviewstr);
    const bound = Math.min(rootFolder.elements.length, rows * cols);
    for (let i = 0; i < bound; ++i) {
        result.elements[i] = rootFolder.elements[i];
    }

    rootFolder = result;
    let structure = rootFolder;
    browser.storage.local.set({structure});
}
