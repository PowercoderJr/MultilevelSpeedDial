window.onload = function() {
    document.getElementById("openHereItem").innerHTML += browser.i18n.getMessage("openInCurrentTab");
    document.getElementById("settingsItem").innerHTML += browser.i18n.getMessage("settings");
    document.getElementById("extensionAmoPageItem").innerHTML += browser.i18n.getMessage("extensionAmoPage");

    document.getElementById("openHereItem").onclick = function() {
        browser.tabs.update({
            url: browser.extension.getURL("mlsd.html")
        });
        window.close();
    }

    document.getElementById("settingsItem").onclick = function() {
        browser.runtime.openOptionsPage();
        window.close();
    }

    document.getElementById("extensionAmoPageItem").onclick = function() {
        browser.tabs.update({
            url: "https://addons.mozilla.org/firefox/addon/multilevel-speed-dial/"
        });
        window.close();
    }
}
