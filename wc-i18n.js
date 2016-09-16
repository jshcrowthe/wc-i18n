(function(window) {
  var _locale = 'en';
  var _i18nStrings = {};

  var WCI18n = window.WCI18n = function(namespace, locales) {
    WCI18n.setNamespaceLocales(namespace, locales);

    return {
      setLocales: function(lang, locales) {
        if (!_i18nStrings[namespace].locales) _i18nStrings[namespace].locales = {};
        _i18nStrings[namespace].locales[lang] = locales;
      },
      _getLocalesRaw: function(lang) {
        lang = lang || WCI18n.getLocale();
        if (_i18nStrings[namespace] && 
            _i18nStrings[namespace].locales) return _i18nStrings[namespace].locales[lang];
      },
      getLocales: function(lang) {
        lang = lang || WCI18n.getLocale();
        return new Promise(function(resolve) {
          if (_i18nStrings[namespace] && 
              _i18nStrings[namespace].locales &&
              _i18nStrings[namespace].locales[lang]) return resolve(_i18nStrings[namespace].locales[lang]);
          throw new Error('The namespace "' + namespace + '" has no locales for lang "' + lang + '"');
        });
      },
      translate: function(string, lang) {
        lang = lang || WCI18n.getLocale();
        return this.getLocales(lang)
          .then(function(locales) {
            // resolve the promise for the current namespace with the current lang 
            return locales && locales[string];
          });
      }
    }
  };

  WCI18n.getLocale = function() {
    return _locale;
  }

  WCI18n.setLocale = function(val) {
    return (_locale = val);
  }

  WCI18n.getNamespaceLocales = function(namespace) {
    return _i18nStrings[namespace] && _i18nStrings[namespace].locales;
  }

  WCI18n.setNamespaceLocales = function(namespace, locales) {
    if (!_i18nStrings[namespace]) _i18nStrings[namespace] = {};
    _i18nStrings[namespace].locales = locales;
  }
})(window);