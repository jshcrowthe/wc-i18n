import { Polymer, html } from '@polymer/polymer/polymer-legacy.js';
import '../../wc-i18n.js';

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }
    </style>
    <h1>[[i18n('bar')]]</h1>
`,

  is: 'demo-comp',

  get importMeta() {
    return import.meta;
  },

  behaviors: [
    WCI18n()
  ]
});
