import { Polymer, html } from '@polymer/polymer/polymer-legacy.js';
import '../wc-i18n.js';
import srcLocales from './test-locales';

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }
    </style>
    <p>[[i18n('hello-msg')]]</p>
`,

  is: 'x-el-inline',

  get importMeta() {
    return import.meta;
  },

  behaviors: [
    WCI18n(srcLocales)
  ]
});
