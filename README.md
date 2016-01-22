[![Build Status](https://travis-ci.org/jshcrowthe/wc-i18n.svg?branch=master)](https://travis-ci.org/jshcrowthe/wc-i18n)

# wc-i18n & wc-i18n-src

This pair of components will handle translations at the component level.

These elements were inspired by the `<i18n-msg>` element, written by [ebidel](https://github.com/ebidel/i18n-msg) as well as the `<i18-n-src>` component written by [p.kaske](https://github.com/pkaske/i18-n).

This solution introduces two elements that provide sourcing and consumption of internationalized strings (respectivly): `<wc-i18n-src>` and `<wc-i18n>`

[Docs & Demo](https://jshcrowthe.github.io/wc-i18n/)

# &lt;wc-i18n-src&gt;

This element also provides language domains (Uses the `default` domain if no other was set) to allow you to have several different sets of translations
living on the same page.

You need at least one `<wc-i18n-src>` in your document. It loads the locales via one of two methods: `AJAX` or manual sourcing. `AJAX` is better suited for
development as compiling and injecting the strings into the `<wc-i18n-src>` tag on every save, though doable, can be tedious. Manual sourcing is better suited
for production as it removes the network overhead/delay associated with fetching locale files for each component on the page.

The domain element provides some public methods to get translation strings.

<strong>Note:</strong> Locale files are only fetched once.

Locale files of the `default` domain will use the locale as the filename:
`locales/en.json`, `locales/de.json`, `locales/fr.json`

Locale files of any domain other than `default` must prepend the domain name, followed by an `_`, before the locale:

"`locales/mydomain_en.json`", "`locales/mydomain_de.json`" or "`locales/mydomain_fr.json`"

### Example of a locale file

```json
{
  "welcome-text": "Welcome!",
  "goodbye-text": "Goodbye!"
}
```

## Example
See the comments on the `<wc-i18n>` element for a simple example.

# &lt;wc-i18n&gt;
`<wc-i18n>` elements define a language domain/key and will only be filled with the translated string from that domain/language.

This element also provides language domains (Uses the `default` domain if no other was set) to allow you to have several different sets of translations
living on the same page.

<strong>Notes:</strong>
- The language to display isn't set on the `<wc-i18n>` elements but on the `<wc-i18n-src>`.
- All `<wc-i18n>` elements, for each domain, are automatically updated after the locale was changed on the domain's `<wc-i18n-src>` element.
- Each `<wc-i18n>` has two modes: `Simple` mode and `Provider` mode.

## Example: Simple Mode

In simple mode each `<wc-i18n>` component will display the output of a translated string.

Simply pass a value to the `key` attribute that is formatted as follows `<domain>.<key>`. Optionally the `domain` can be omitted to use the
default domain

### Default Domain
```html
<wc-i18n-src
  locale-dir="path/to/locales"
  locale="de">
</wc-i18n-src>

<p>
  <wc-i18n key="welcome-text">This will be replaced with the welcome text from the default domain.</wc-i18n>
</p>

```

### Passed Domain
```html
<wc-i18n-src
  locale-dir="path/to/some/other/locales"
  domain="foobar"
  locale="de">
</wc-i18n-src>

<p>
  <wc-i18n key="foobar.welcome-text">This will be replaced from path/to/locales/foobar-de.json</wc-i18n>
</p>
```

## Example: Provider Mode

In `provider` mode `<wc-i18n>` will *not* display the output of the translated string.
Instead you can use the `value` attribute to interact with the translated string (via data-binding, etc).

_NOTE: The value attribute will be set regardless of whether the component is in `simple` or `provider` mode.
Provider mode simply offers you a way to use the translated string without rendering it._

```html
Create your wc-i18n-src element here (see first example)

<p>
  The label is set by the wc-i18n.
  <paper-input label="[[username]]"></paper-input>
</p>
<p>
  This wc-i18n doesn't show the translation but you can use it's *value* attribute.
  <wc-i18n provider key="foobar.username" value="{{username}}"></wc-i18n>
</p>
```

# `WCI18nBehavior`

This component comes with a small behavior that provides a function to help with locale loading.

Check out the [component page](https://jshcrowthe.github.io/wc-i18n/) for more information.
