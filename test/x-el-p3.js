import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import '../wc-i18n.js';
import srcLocales from './test-locales.js';

class XElP3 extends mixinBehaviors([WCI18n(srcLocales)], PolymerElement) {
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
      <p>[[i18n('hello-msg')]]</p>
    `;
  }
}

customElements.define('x-el-p3', XElP3);