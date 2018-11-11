[![Build Status](https://travis-ci.org/jshcrowthe/wc-i18n.svg?branch=master)](https://travis-ci.org/jshcrowthe/wc-i18n)

# WCI18n

`WCI18n` is a lightweight `i18n` solution for web components, in API it is quite similar to [`Polymer.AppLocalizeBehavior`](https://github.com/PolymerElements/app-localize-behavior) but it is approaching the problem from a different angle.

`WCI18n` assumes native support for the following two APIs:

- `Promise`
- `fetch`

If you don't have access to these two APIs in your target browser you will need to load them. Some quality polyfills can be found below:

- `Promise` - https://github.com/taylorhakes/promise-polyfill
- `fetch` - https://github.com/github/fetch

There are a couple of distinct design differences between `WCI18n` and [`Polymer.AppLocalizeBehavior`](https://github.com/PolymerElements/app-localize-behavior)

Specifically:

- There is only 1 language allowed across the **entire** application
- Each registered custom element defines (and fetches) its own locales, there is no support for a single locale file
- Each component will fetch **only** the locales it needs for the current language (meaning that for production, inlining a formatted locale object is advisable)

## Example Usage

### Basic Usage

`WCI18n` is included and used in your component as follows:

#### Polymer 3 Classes

`WCI18n` uses importPath, so components should define `importMeta` as shown here.

```js
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import '../wc-i18n.js';
import srcLocales from './test-locales.js';

class CustomEl extends mixinBehaviors([WCI18n(srcLocales)], PolymerElement) {
  static get importMeta() {
    return import.meta;
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <p>[[i18n('key')]]</p>
    `;
  }
}
customElements.define('custom-el', CustomEl);
```

#### Polymer 3 Legacy Constructor

`WCI18n` uses importPath, so components should define `importMeta` as shown here.

```js
import { Polymer, html } from '@polymer/polymer/polymer-legacy.js';
import '../wc-i18n.js';

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }
    </style>
  <p>[[i18n('key')]]</p>

`,

  is: 'x-el',

  get importMeta() {
    return import.meta;
  },

  behaviors: [
    WCI18n()
  ]
});

```

You can inject a translation object by passing a formatted locales object to the `WCI18n` function.

_Formatted Object_

```
{
  "en": {
    "key": "value"
  },
  "fr": {
    "key": "valeur"
  }
}
```
_Example Injection_

```html
<dom-module id='custom-el'>
  <template>
    <!-- Use the provided `i18n` function -->
    <p>i18n('key')</p>
  </template>
  <script>
    Polymer({
      is: 'custom-el',
      behaviors: [
        WCI18n({ en: { key: "value"}, fr: { key: "valeur" }}) // <-- Injected translations
      ]
    });
  </script>
</dom-module>
```
### String Interpolation

Currently this component **does not** use the native `Intl` object and the `IntlMessageFormat` standards for legacy browser support. However
basic string interpolation is supported via 2 means:

- `key` -> `val` sequential string params
- String format object

**For example**, if you take the following format string:

```
I love to take my {noun} to the {place}
```

You could do interpolation either of the following ways:

```
i18n('key', 'noun', 'cat', 'place', 'groomer');
```

```
i18n('key', { "noun": "cat", "place": "groomer" })
```

Both will create the following string:

```
I love to take my cat to the groomer
```

## Global Config

### Language

In addition to the typical component setup `wc-i18n` provides some addition functions that you can use to configure the language of your application

#### Global Preset

By pre-defining the `window.WCI18n` object you can create a new default language for your application. 
This can be an easy way to set consistent global languages across multiple pages

_Example:_

```html
<!DOCTYPE html>
<html>
<head>
  <title>Define WCI18n</title>
 
  <script>
    // By predefining this object the language 
    // will default to 'ko' not 'en'
    window.WCI18n = { language: 'ko' };
  </script>

  <!-- Web Components -->
  <link rel='import' href="my/component/bundle.html">
 </head>
 <body>
   ...
 </body>
 </html>
```

#### Global Setter

The `WCI18n` object now also exposes a `setLanguage` function that can be called to set the language to a given locale.

_Example:_

```javascript
window.WCI18n.setLanguage('ko'); //- Sets language to 'ko'
```

## Running Docs Locally

1. (Once) Install/Update the [Polymer CLI](https://www.npmjs.com/package/polymer-cli): ```npm i -g polymer-cli```

1. Run `bower i` to load all of the dependencies.
1. Run `polymer analyze > analysis.json` to set up docs page.
1. Run `polymer serve -o` to run and view docs page including demo.

## Bugs/Comments

Please feel free to leave a [github issue](https://github.com/jshcrowthe/wc-i18n/issues) if there is a bug or feedback on how to improve this solution
