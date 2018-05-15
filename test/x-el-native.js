class XElNative extends WCI18nMixin(HTMLElement) {
  constructor() {
    super();
    this._name = '';
    this._rendered = false;
    this.instanceNum = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this._rendered) {
      this._rendered = true;

      this.setAttribute('data-test', 'x-el-native');
      // NOTE: generate a unique component ID so we can safely query by ID even with no shadow DOM
      this.setAttribute('data-test-pill-id', ++this.instanceNum);

      this.innerHTML = `<span class="x-el-native__name" data-test="filter-pill-name">${this._name}</span><button class="x-el-native__remove fs-icon fs-icon-close" type="button" data-test="filter-pill-remove-button"></button>`;

      const removeBtn = this.querySelector('.x-el-native__remove');
      removeBtn.addEventListener('click', e => {
        this.dispatchEvent(new CustomEvent('remove-filter', {bubbles: true, detail: this.id}));
      });

      const temp = this.getAttribute('name');
      if (temp) {
        this._name = temp;
      }
    }
  }

  /*
   * Getters and setters
   */
  get name() {
    return this._name;
  }

  set name(newName) {
    this._name = newName;
    if (this._rendered) {
      this.querySelector('span').textContent = newName;
    }
  }
}

/*
 * Define the custom element
 */
customElements.define('x-el-native', XElNative);
