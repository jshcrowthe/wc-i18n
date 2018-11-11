import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import '../../wc-i18n.js';

class XElNestedP3 extends mixinBehaviors([WCI18n()], PolymerElement) {
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
      <p>[[i18n('fancy-msg', data)]]</p>
    `;
  }

  static get properties() {
    return {
      data: {
        type: Object,
        computed: 'computeData(i18n)'
      }
    }
  }

  computeData(i18n) {
    return {type: i18n('red'), thing: i18n('ball')};
  }
}

customElements.define('x-el-nested-p3', XElNestedP3);