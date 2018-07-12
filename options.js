import * as ElementTypes from './elements/elementTypes.js';
import * as BgTypes from './elements/bgTypes.js';

import {initFolderForm, onPromiseFailed, readFile, remoteImageToBase64,
    updateGridSizeChangedListener} from './mlsd.js';
import {DEFAULT_BGCOLOR} from './elements/defaultBgColor.js';
import Folder from './elements/Folder.js';

/**
 * Корневая папка
 *
 * @var Folder  rootFolder
 */
let rootFolder;

/**
 * Настройки
 *
 * Содержит информацию о пользовательских настройках расширения
 *
 * @var Object  settings
 */
let settings;

window.onload = function() {
    browser.storage.local.get(['structure', 'settings']).
            then(function(results) {
        onStructureLoaded(results);
        initFolderForm(rootFolder);
        refillRootFolderForm();
        onSettingsLoaded(results);
        refillNewTabFocusForm();
        refillNewTabActiveForm();
    }, onPromiseFailed);

    /*Форма "дополнительные полномочия расширения"*/
    document.getElementById("permissionsSettingsLabel").textContent = browser.i18n.getMessage("permissionsSettings");
    document.getElementById("historyPermissionLabel").textContent = browser.i18n.getMessage("historyPermission") + ":";
    document.getElementById("tabHidePermissionLabel").textContent = browser.i18n.getMessage("tabHidePermission") + ":";

    let onPermissionInfoReceived = function(permission, granted) {
        document.getElementById(permission + "PermissionBtn").disabled = false;
        if (granted) {
            document.getElementById(permission + "PermissionBtn").value = browser.i18n.getMessage("permissionDisable");
            document.getElementById(permission + "PermissionStatusLabel").textContent = browser.i18n.getMessage("permissionEnabled");
            document.getElementById(permission + "PermissionStatusLabel").setAttribute("tag", "enabled");
        } else {
            document.getElementById(permission + "PermissionBtn").value = browser.i18n.getMessage("permissionEnable");
            document.getElementById(permission + "PermissionStatusLabel").textContent = browser.i18n.getMessage("permissionDisabled");
            document.getElementById(permission + "PermissionStatusLabel").setAttribute("tag", "disabled");
        }
    }

    let optionalPermissionsList = ["history", "tabHide"];
    for (let i = 0; i < optionalPermissionsList.length; ++i) {
        let permission = optionalPermissionsList[i];
        let btn = document.getElementById(permission + "PermissionBtn");

        btn.onclick = function() {
            let isEnabledNow = document.getElementById(permission + "PermissionStatusLabel").getAttribute("tag") && 
                    document.getElementById(permission + "PermissionStatusLabel").getAttribute("tag") == "enabled";
            document.getElementById(permission + "PermissionStatusLabel").textContent = "...";
            document.getElementById(permission + "PermissionStatusLabel").setAttribute("tag", "");
            if (isEnabledNow) {
                browser.permissions.remove({permissions: [permission]}).then(function(revoked) {
                    onPermissionInfoReceived(permission, !revoked);
                }, onPromiseFailed);
            } else {
                browser.permissions.request({permissions: [permission]}).then(function(granted) {
                    onPermissionInfoReceived(permission, granted);
                }, onPromiseFailed);
            }
        }

        browser.permissions.contains({permissions: [permission]}).then(function(granted) {
            onPermissionInfoReceived(permission, granted);
        }, onPromiseFailed);
    }

    /*Форма "настройки корневой папки"*/
    document.getElementById("rootFolderSettingsLabel").textContent = browser.i18n.getMessage("rootFolderSettings");
    document.getElementById("rootFolderSettingsDescLabel").textContent = browser.i18n.getMessage("rootFolderSettingsDesc");
    document.getElementById("rootFolderSettingsDescLabel").innerHTML = document.getElementById("rootFolderSettingsDescLabel").innerHTML.replace(/\n/g, "<br/>");
    document.getElementById("okBtn").value = browser.i18n.getMessage("save");
    document.getElementById("restoreBtn").value = browser.i18n.getMessage("restore");

    document.getElementById("folderSettingsForm").onsubmit = function(event) {
        event.preventDefault();
        browser.storage.local.get('structure').then(function(results) {
            onStructureLoaded(results);
            saveFolderSettings().then(function() {
                refillRootFolderForm();
                updateGridSizeChangedListener(rootFolder);
            }, onPromiseFailed);
        }, onPromiseFailed);
    }

    document.getElementById("restoreBtn").onclick = function(event) {
        if (confirm(browser.i18n.getMessage("rlyRestoreRootFolderForm"))) {
            browser.storage.local.get('structure').then(function(results) {
                onStructureLoaded(results);
                refillRootFolderForm();
                updateGridSizeChangedListener(rootFolder);
            }, onPromiseFailed);
        }
    }

    /*Форма "захват фокуса на новой вкладке"*/
    document.getElementById("newTabFocusSettingsLabel").textContent = browser.i18n.getMessage("newTabFocusSettings");
    document.getElementById("newTabFocusSettingsDescLabel").textContent = browser.i18n.getMessage("newTabFocusSettingsDesc");
    document.getElementById("newTabFocusSettingsDescLabel").innerHTML = document.getElementById("newTabFocusSettingsDescLabel").innerHTML.replace(/\n/g, "<br/>");
    document.getElementById("focusPageLabel").innerHTML += browser.i18n.getMessage("focusPage");
    document.getElementById("focusAddressBarLabel").innerHTML += browser.i18n.getMessage("focusAddressBar");

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

    /*Форма "поведение при открытии новой вкладки сочетанием клавиш"*/
    document.getElementById("newTabActiveSettingsLabel").textContent = browser.i18n.getMessage("newTabActiveSettings");
    document.getElementById("newTabActiveYesLabel").innerHTML += browser.i18n.getMessage("newTabActiveYes");
    document.getElementById("newTabActiveNoLabel").innerHTML += browser.i18n.getMessage("newTabActiveNo");

    let onNewTabActiveParamChanged = function () {
        browser.storage.local.get('settings').then(function(results) {
            onSettingsLoaded(results);
            settings.newTabActive =
                    document.getElementById("newTabActiveYesRb").checked;
            browser.storage.local.set({settings});
        }, onPromiseFailed);
    }
    bufControls = document.getElementsByName("newTabActive");
    bufControls.forEach(function(item) {
        item.oninput = onNewTabActiveParamChanged;
    }, onPromiseFailed);

    /*Форма "выгрузка и загрузка структуры закладок"*/
    document.getElementById("structureManagingLabel").textContent = browser.i18n.getMessage("structureManaging");
    document.getElementById("structureManagingDescLabel").textContent = browser.i18n.getMessage("structureManagingDesc");
    document.getElementById("uploadSyncStorageBtn").value = browser.i18n.getMessage("uploadSyncStorage");
    document.getElementById("downloadSyncStorageBtn").value = browser.i18n.getMessage("downloadSyncStorage");
    document.getElementById("getJsonStructureBtn").value = browser.i18n.getMessage("getJsonStructure");
    document.getElementById("fakeSetJsonStructureBtn").value = browser.i18n.getMessage("setJsonStructure");
    document.getElementById("setDefaultStorageBtn").value = browser.i18n.getMessage("setDefaultStorage");

    document.getElementById("uploadSyncStorageBtn").onclick = function() {
        if (confirm(browser.i18n.getMessage("rlyOverwriteRemoteStructure"))) {
            browser.storage.local.get('structure').then(function(results) {
                if (results.structure) {
                    let eraseImagesInfo = function(item) {
                        if (item.type == ElementTypes.BOOKMARK) {
                            item.miniature = "";
                        } else if (item.type == ElementTypes.FOLDER) {
                            item.bgdata = "";
                            if (item.bgType == BgTypes.IMAGE_LOCAL) {
                                item.bgviewstr = "";
                            }
                            for (let i = 0; i < item.elements.length; ++i) {
                                eraseImagesInfo(item.elements[i]);
                            }
                        }
                    };
                    eraseImagesInfo(results.structure);
                    browser.storage.sync.set({
                        structure: results.structure
                    }).then(function() {
                        //Success
                        console.log(results.structure);
                    }, alert); //не удалось загрузить в синк
                } else {
                    alert(browser.i18n.getMessage("noStructureInLocal")); //в локал нет структуры
                }
            }, alert); //ошибка чтения из локал
        }
    }
    document.getElementById("downloadSyncStorageBtn").onclick = function() {
        if (confirm(browser.i18n.getMessage("rlyOverwriteCurrStructure"))) {
            browser.storage.sync.get('structure').then(function(results) {
                if (results.structure) {
                    browser.storage.local.set({
                        structure: results.structure
                    }).then(function() {
                        //Success
                        browser.storage.local.get('structure').
                                then(function(results) {
                            onStructureLoaded(results);
                            refillRootFolderForm();
                            updateGridSizeChangedListener(rootFolder);
                        }, onPromiseFailed);
                    }, alert); //не удалось загрузить в локал
                } else {
                    alert(browser.i18n.getMessage("noStructureInSync")); //в синк нет структуры
                }
            }, alert); //ошибка чтения из синк
        }
    }
    document.getElementById("getJsonStructureBtn").onclick = function() {
        browser.permissions.request({permissions: ["downloads"]}).
                then(function(granted) {
            if (granted) {
                browser.storage.local.get('structure').then(function(results) {
                    if (results.structure) {
                        let structureStr = JSON.stringify(results.structure);
                        let structureBlob = new Blob([structureStr]);
                        let url = URL.createObjectURL(structureBlob);
                        let releaseResources = function() {
                            browser.permissions.remove({
                                permissions: ["downloads"]
                            });
                            URL.revokeObjectURL(url);
                        }
                        browser.downloads.download({
                            url: url,
                            saveAs: true,
                            filename: "mlsd-structure.json"
                        }).then(function(id) {
                            let listener = function(item) {
                                if (item.id == id) {
                                    browser.downloads.onChanged.
                                            removeListener(listener);
                                    releaseResources();
                                }
                            };
                            browser.downloads.onChanged.addListener(listener);
                        }, releaseResources);
                    } else {
                        alert(browser.i18n.getMessage("noStructureInLocal")); //в локал нет структуры
                    }
                }, alert); //ошибка чтения из локал
            }
        }, onPromiseFailed);
    }
    document.getElementById("fakeSetJsonStructureBtn").onclick = function() {
        document.getElementById("setJsonStructureBtn").click();
    }
    document.getElementById("setJsonStructureBtn").oninput = async function() {
        if (document.getElementById("setJsonStructureBtn").files.length > 0 &&
                confirm(browser.i18n.getMessage("rlyOverwriteCurrStructure"))) {
            document.getElementById("jsonStructureSpinner").style.display = "initial";
            await readFile(document.getElementById("setJsonStructureBtn").files[0],
                    document.getElementById("jsonStructureSpinner"), false).
                    then(function(data) {
                let structure;
                try {
                    structure = JSON.parse(data);
                    browser.storage.local.set({structure}).
                            then(function(results) {
                        //Success
                        browser.storage.local.get('structure').
                                then(function(results) {
                            onStructureLoaded(results);
                            refillRootFolderForm();
                            updateGridSizeChangedListener(rootFolder);
                        }, onPromiseFailed);
                    }, alert); //не удалось загрузить в локал
                } catch (e) {
                    alert(e.message);
                }
            }, onPromiseFailed);
        }
    }
    document.getElementById("setDefaultStorageBtn").onclick = function() {
        if (confirm(browser.i18n.getMessage("rlyOverwriteCurrStructure"))) {
            let structure = new Folder(-1,
                    browser.i18n.getMessage("extensionName"));
            browser.storage.local.set({structure}).then(function(results) {
                //Success
                browser.storage.local.get('structure').then(function(results) {
                    onStructureLoaded(results);
                    refillRootFolderForm();
                    updateGridSizeChangedListener(rootFolder);
                }, onPromiseFailed);
            }, alert); //не удалось загрузить в локал
        }
    }
}

function onStructureLoaded(results) {
    if (results.structure) {
        rootFolder = results.structure;
    } else {
        rootFolder = new Folder(-1, browser.i18n.getMessage("extensionName"));
        browser.storage.local.set({structure: rootFolder});
    }
}

function onSettingsLoaded(results) {
    if (results.settings) {
        settings = results.settings;
    } else {
        settings = {
            doPageFocus: true,
            newTabActive: true
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
    document.getElementById("fakeBgimgPickerLabel").textContent = browser.i18n.getMessage("nofilechosen");

    document.getElementById("rowsSpin").value = rootFolder.rows;
    document.getElementById("colsSpin").value = rootFolder.cols;
    document.getElementById("rowsOld").value = rootFolder.rows;
    document.getElementById("colsOld").value = rootFolder.cols;
    document.getElementById("defaultBgRb").checked = rootFolder.bgtype == BgTypes.DEFAULT;
    document.getElementById("bgcolorPicker").disabled = !(document.getElementById("colorBgRb").checked = rootFolder.bgtype == BgTypes.SOLID);
    document.getElementById("bgimgPicker").disabled = !(document.getElementById("imgLocalBgRb").checked = rootFolder.bgtype == BgTypes.IMAGE_LOCAL);
    document.getElementById("fakeBgimgPickerBtn").disabled = !(document.getElementById("imgLocalBgRb").checked = rootFolder.bgtype == BgTypes.IMAGE_LOCAL);
    document.getElementById("bgimgUrlTf").disabled = !(document.getElementById("imgRemoteBgRb").checked = rootFolder.bgtype == BgTypes.IMAGE_REMOTE);
    switch (rootFolder.bgtype) {
        case (BgTypes.SOLID):
            document.getElementById("bgcolorPicker").value = rootFolder.bgdata;
            break;
        case (BgTypes.IMAGE_LOCAL):
            if (rootFolder.bgviewstr.length == 0) {
                document.getElementById("bgimgPicker").required = true;
                document.getElementById("bgimgBase64").value = "";
            } else {
                document.getElementById("bgimgPicker").required = false;
                document.getElementById("bgimgBase64").value = rootFolder.bgdata;
                document.getElementById("fakeBgimgPickerLabel").textContent = rootFolder.bgviewstr;
            }
            break;
        case (BgTypes.IMAGE_REMOTE):
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
 * Заполнение формы настроек поведения при открытии новой вкладки
 */
function refillNewTabActiveForm() {
    document.getElementById("newTabActiveNoRb").checked =
            !(document.getElementById("newTabActiveYesRb").checked =
            settings.newTabActive);
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
        bgtype = BgTypes.DEFAULT;
        bgdata = null;
        bgviewstr = "";
    }
    else if (document.getElementById("colorBgRb").checked) {
        bgtype = BgTypes.SOLID;
        bgdata = document.getElementById("bgcolorPicker").value;
        bgviewstr = "";
    }
    else if (document.getElementById("imgLocalBgRb").checked) {
        bgtype = BgTypes.IMAGE_LOCAL;
        const picker = document.getElementById("bgimgPicker");
        if (picker.files.length > 0) {
            let file = picker.files[0];
            document.getElementById("imgLocalBgSpinner").style.display = "initial";
            await readFile(file, document.getElementById("imgLocalBgSpinner"), true).
                    then(function(data) {bgdata = data;}, onPromiseFailed);
            bgviewstr = picker.files[0].name;
        } else {
            bgdata = document.getElementById("bgimgBase64").value;
            bgviewstr = document.getElementById("fakeBgimgPickerLabel").textContent;
        }
    }
    else if (document.getElementById("imgRemoteBgRb").checked) {
        bgtype = BgTypes.IMAGE_REMOTE;
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
    browser.storage.local.set({structure: rootFolder});
}
