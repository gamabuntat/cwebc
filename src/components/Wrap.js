import { CustomElements } from './CustomElement';

export class XWrap extends CustomElements {
  connectedCallback() {
    this.render();
  }

  static observedAttributes = ['count'];

  get count() {
    return Number(this.effect('count')) || 0;
  }

  set count(v) {
    this.setAttribute('count', v);
    this.querySelector('x-foo').setAttribute('count', v);
  }

  render() {
    this.html`
      <x-foo count=2 count-count=1 color="gold"></x-foo>
    `;
  }
}

customElements.define('x-wrap', XWrap);

