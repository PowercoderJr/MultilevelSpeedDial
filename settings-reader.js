export function onSettingsLoaded(results) {
    let settings;
    if (results.settings) {
        settings = results.settings;
        if (!("showNumbers" in settings)) {
            settings.showNumbers = true;
        }
        if (!("roundCorners" in settings)) {
            settings.roundCorners = false;
        }
        if (!("doPageFocus" in settings)) {
            settings.doPageFocus = true;
        }
        if (!("newTabActive" in settings)) {
            settings.newTabActive = true;
        }
    } else {
        settings = {
            showNumbers: true,
            roundCorners: false,
            doPageFocus: true,
            newTabActive: true,
        }
        browser.storage.local.set({settings});
    }
    return settings;
}
