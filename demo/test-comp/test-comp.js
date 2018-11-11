import { Polymer, html } from '@polymer/polymer/polymer-legacy.js';
import '../../wc-i18n.js';

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }
    </style>
    <h1>[[i18n('foo')]]</h1>
`,

  is: 'test-comp',

  get importMeta() {
    return import.meta;
  },

  behaviors: [
    WCI18n()
  ]
});
