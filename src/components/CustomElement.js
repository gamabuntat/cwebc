export class CustomElement extends HTMLElement {
  attrs = [];
  attrsStack = [];
  handlersMap = new Map();

  html(strings, ...replacements) {
    if (this.attrs.length > 0) {
      this.attrsStack.push(this.attrs);
      this.attrs = [];
    }
    const states = [];
    const localAttrs = [];
    const result = strings.reduce((acc, str, idx) => {
      debugger;
      const replace = replacements[idx];
      if (!replace) return `${acc}${str}`;
      if (!(typeof replace === 'function')) return `${acc}${str}${replace}`;
      const attrName = str.match(/([\w-]+)=$/)?.[1];
      if (attrName) localAttrs.push(attrName);
      states.push(replace);
      const giglet = attrName
        ? `"${states.length - 1}"`
        : `<!-- ${states.length - 1} -->`;
      return `${acc}${str}${giglet}`;
    }, '');
    const tmpl = document.createElement('template');
    tmpl.innerHTML = result;
    this.processContent(tmpl, states);
    debugger;
    if (this.attrsStack.length > 0) {
      this.attrs = this.attrsStack.pop();
    }
    return tmpl;
    // this.processAttributes(tmpl);
    // this.replaceSlots(tmpl);
    // this.innerHTML = '';
    // console.log(tmpl.content);
    // this.append(tmpl.content);
  }

  processContent(tmpl, states) {
    const comments = this.findComments(tmpl.content);
    comments.forEach((comment) => {
      comment.parentElement.childNodes.forEach((node) => {
        if (node === comment) {
          const state = states[Number(comment.nodeValue.match(/\d+/)?.[0])];
          const value = state?.();
          let attr = this.attrs.pop();
          while (attr) {
            const handlers = this.handlersMap.get(attr);
            const swp = document.createElement('div');
            let oldNode = comment;
            const handler = (v = state()) => {
              if (v === false) v = '';
              else if (v instanceof HTMLTemplateElement) swp.append(v.content);
              else if (v instanceof HTMLElement) swp.append(v);
              else swp.innerHTML = v;
              const childNode =
                swp.childNodes[0] ?? document.createTextNode('');
              console.log(childNode);
              oldNode.replaceWith(childNode);
              oldNode = childNode;
            };
            if (!handlers) {
              this.handlersMap.set(attr, [handler]);
            } else {
              handlers.push(handler);
            }
            attr = this.attrs.pop();
            handler(value);
          }
        }
      });
    });
  }

  processAttributes(tmpl) {
    this.localAttrs.forEach((localAttr) => {
      tmpl.content.querySelectorAll(`[${localAttr}]`).forEach((elem) => {
        const state = this.states[Number(elem.getAttribute(localAttr))];
        if (localAttr.startsWith('on') && localAttr in window) {
          elem.removeAttribute(localAttr);
          elem.addEventListener(localAttr.slice(2), state);
          return;
        }
        this.attrs.clear();
        state?.();
        const attrs = this.attrs;
        this.attrs = new Set();
        attrs.forEach((attr) => {
          const handlers = this.handlersMap.get(attr);
          const handler = () => {
            const newAttrValue = state();
            this.setAttribute.call(elem, localAttr, newAttrValue);
          };
          if (!handlers) {
            this.handlersMap.set(attr, [handler]);
          } else {
            handlers.push(handler);
          }
          handler();
        });
      });
    });
  }

  effectAttribute(name) {
    this.attrs.push(name);
    return name;
  }

  getBooleanAttr(name) {
    return this.getAttribute(name) === '';
  }

  setAttribute(name, value) {
    if (typeof value === 'boolean') {
      if (value) {
        super.setAttribute(name, '');
        return;
      }
      this.removeAttribute(name);
      return;
    }
    super.setAttribute(name, value);
  }

  slotsAsData() {
    const data = new Map();
    this.querySelectorAll('[slot]').forEach((el) => {
      const slotName = el.getAttribute('slot');
      const dataValue = data.get(slotName) || [];
      dataValue.push(el);
      data.set(slotName, dataValue);
    });
    return data;
  }

  replaceSlots(tmpl) {
    const slotData = this.slotsAsData();
    tmpl.content.querySelectorAll('slot').forEach((slot) => {
      const elems = slotData.get(slot.getAttribute('name'));
      slot.replaceWith(...(elems || []));
    });
  }

  findComments(element) {
    const comments = [];
    const iterator = document.createNodeIterator(
      element,
      NodeFilter.SHOW_COMMENT,
      () => NodeFilter.FILTER_ACCEPT
    );
    while (true) {
      const node = iterator.nextNode();
      if (node == null) {
        break;
      }
      comments.push(node);
    }
    return comments;
  }

  attributeChangedCallback(name) {
    this.handlersMap.get(name)?.forEach((handler) => {
      handler();
    });
  }

  connectedCallback() {
    const template = this.render();
    this.append(template.content);
  }
}
