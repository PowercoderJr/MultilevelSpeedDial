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

    browser.storage.local.get(['settings']).then(function(results) {
        if (results.settings && results.settings.darkTheme) {
            document.documentElement.style.setProperty("--backgroundColor",
                    "var(--grey-60)");
            document.documentElement.style.setProperty("--hoverColor",
                    "#5c5c61");
            document.documentElement.style.setProperty("--textColor",
                    "var(--grey-10)");
            document.documentElement.style.setProperty("--imgFilter",
                    "invert(100%)");
        } else {
            document.documentElement.style.setProperty("--backgroundColor",
                    "var(--white-100)");
            document.documentElement.style.setProperty("--hoverColor",
                    "var(--grey-90-a05)");
            document.documentElement.style.setProperty("--textColor",
                    "var(--grey-90)");
            document.documentElement.style.setProperty("--imgFilter",
                    "none");
        }
    });
}
