import { Polymer, html } from '@polymer/polymer/polymer-legacy.js';
import '../../wc-i18n.js';

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }
    </style>
    <h1>[[i18n('baz', 'count', count)]]</h1>
    <h1>[[i18n('baz', countObj)]]</h1>
`,

  is: 'fancy-el',

  get importMeta() {
    return import.meta;
  },

  behaviors: [
    WCI18n()
  ],

  properties: {
    count: {
      type: Number,
      value: 123
    },
    countObj: {
      type: Object,
      value: function() {
        return { count: 321 }
      }
    }
  }
});
