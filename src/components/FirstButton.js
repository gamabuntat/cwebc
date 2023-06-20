import { CustomElement } from './CustomElement';

class FirstButton extends CustomElement {
  static observedAttributes = [
    'disabled',
    'color',
    'size',
    'text',
    'class',
    'icon-only',
  ];

  get iconOnly() {
    return this.getBooleanAttr(this.effectAttribute('icon-only'));
  }

  set iconOnly(value) {
    this.setAttribute('icon-only', value);
  }

  get size() {
    return this.getAttribute(this.effectAttribute('size'));
  }

  set size(value) {
    this.setAttribute('size', value);
  }

  get color() {
    return this.getAttribute(this.effectAttribute('color'));
  }

  set color(value) {
    this.setAttribute('color', value);
  }

  get disabled() {
    return this.getBooleanAttr(this.effectAttribute('disabled'));
  }

  set disabled(value) {
    this.setAttribute('disabled', value);
  }

  get text() {
    return this.getAttribute(this.effectAttribute('text'));
  }

  set text(value) {
    this.setAttribute('text', value);
  }

  get onClick() {
    return this._onClick;
  }

  set onClick(value) {
    this._onClick = value;
  }

  get onDbClick() {
    return this._onDbClick;
  }

  set onDbClick(value) {
    this._onDbClick = value;
  }

  render() {
    return this.html`
      <button>
        ${() =>
          !this.iconOnly && (() => this.html`<span>${() => this.text}</span>`)}
      </button>
    `;
  }
}

customElements.define('first-button', FirstButton);
