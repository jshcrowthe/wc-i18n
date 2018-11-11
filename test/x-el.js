import { Polymer, html } from '@polymer/polymer/polymer-legacy.js';
import '../wc-i18n.js';

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }
    </style>
    <p>[[i18n('hello-msg')]]</p>
`,

  is: 'x-el',

  get importMeta() {
    return import.meta;
  },

  behaviors: [
    WCI18n()
  ]
});
