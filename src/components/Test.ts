export class TestElement extends HTMLElement {
  static haha = 'haha';

  connectedCallback() {
    const container = document.createElement('div');
    container.append(...this.children);
    this.innerHTML = this.render();
    const slotText = this.querySelector('slot[name="text"]');
    slotText?.replaceWith(container.querySelector('[slot="text"]'));
    this.changeBg(this.dataset.color);
  }

  static get observedAttributes() {
    return ['color'];
  }

  attributeChangedCallback(_name: string, _oldValue: string, newValue: string) {
    this.changeBg(newValue);
  }

  changeBg(color = 'tomato') {
    const hehe = this.querySelector('.hehe');
    if (hehe) {
      hehe.style.backgroundColor = color;
    }
  }

  render(slot) {
    return `
      <div class="haha">
        <button class="hehe">
          <slot name="text"></slot>
        </button>
      </div>`;
  }
}

setTimeout(() => {
  customElements.define('test-element', TestElement);
  console.log('ready')
}, 1e4);
