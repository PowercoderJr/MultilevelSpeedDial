const defaults = {
    showNumbers: true,
    roundCorners: false,
    darkTheme: false,
    doPageFocus: true,
    newTabActive: true,
    kbdnavOn: true
};
Object.freeze(defaults);

export function onSettingsLoaded(results) {
    let settings = {};
    if (results.settings) {
        settings = results.settings;
    }
    let changed = false;
    for (let key in defaults) {
        if (!(key in settings)) {
            settings[key] = defaults[key];
            changed = true;
        }
    }
    if (changed) {
        browser.storage.local.set({settings});
    }
    return settings;
}
