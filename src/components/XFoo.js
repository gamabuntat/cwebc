import { CustomElements } from './CustomElement';

function gc() {
  return this.color;
}

export class XFoo extends CustomElements {
  connectedCallback() {
    this.render();
  }

  static observedAttributes = ['count', 'color', 'another', 'count-count'];

  get countCount() {
    return this.effect('count-count');
  }

  get count() {
    return this.effect('count');
  }

  get color() {
    return this.effect('color');
  }

  get another() {
    return this.effect('another');
  }

  render() {
    this.html`
      <div>
        <span style="display: inline-flex;">span</span>
        <span>
          haha
          hehe
          ${() => (Number(this.count) + Number(this.countCount)) ** 2}
          justtext
        </span>
        <div>
          <div>
            haah
            ${() => gc.call(this)}
            hui
            <span>${() => this.count}</span>
          </div>
        </div>
      </div>
      <div>outside</div>
    `;
  }
}

customElements.define('x-foo', XFoo);
