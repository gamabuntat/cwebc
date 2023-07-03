export class CustomElement extends HTMLElement {
  attrs = [];
  attrsStack = [];
  handlersMap = new Map();
  slotsData = this.slotsAsData();

  connectedCallback() {
    this.innerHTML = '';
    const template = this.render();
    this.append(template.content);
  }

  html(strings, ...replacements) {
    if (this.attrs.length > 0) {
      this.attrsStack.push(this.attrs);
      this.attrs = [];
    }
    const states = [];
    const localAttrs = [];
    const result = strings.reduce((acc, str, idx) => {
      const replace = replacements[idx];
      if (replace === void 0) return `${acc}${str}`;
      if (!replace) return `${acc}${str}""`;
      if (!(typeof replace === 'function')) return `${acc}${str}"${replace}"`;
      const attrName = str.match(/([\w-]+)=$/)?.[1];
      if (attrName) localAttrs.push(attrName);
      states.push(replace);
      const giglet = attrName
              ? `"${states.length - 1}"`
              : `<!-- ${states.length - 1} -->`;
      return `${acc}${str}${giglet}`;
    }, '').trim();
    const tmpl = document.createElement('template');
    tmpl.innerHTML = result;
    const handlersMapKey = tmpl.content.childNodes.length > 1
            ? this
            : tmpl.content.childNodes[0];
    this.handlersMap.set(handlersMapKey, new Map());
    this.processContent(tmpl, states, handlersMapKey);
    this.processAttributes(tmpl, states, localAttrs, handlersMapKey);
    this.replaceSlots(tmpl);
    this.attrs = this.attrsStack.pop() ?? [];
    return tmpl;
  }

  processContent(tmpl, states, handlersMapKey) {
    const comments = this.findComments(tmpl.content);
    comments.forEach((comment) => {
      comment.parentNode.childNodes.forEach((node) => {
        if (node === comment) {
          const state = states[Number(comment.nodeValue.match(/\d+/)?.[0])];
          const value = state?.();
          let attr = this.attrs.pop();
          while (attr) {
            const handlerItems = this.handlersMap
                    .get(handlersMapKey)
                    .get(attr);
            const swp = document.createElement('div');
            let oldNode = comment;
            const handler = (v = state()) => {
              if (typeof v === 'function') v = v();
              if (v === false) v = '';
              else if (v instanceof HTMLTemplateElement) swp.append(v.content);
              else swp.append(v);
              const childNode =
                      swp.childNodes[0] ?? document.createTextNode('');
              oldNode.replaceWith(childNode);
              oldNode = childNode;
            };
            if (!handlerItems) {
              this.handlersMap
                      .get(handlersMapKey)
                      .set(attr, [handler]);
            } else {
              handlerItems.push(handler);
            }
            handler(value);
            attr = this.attrs.pop();
          }
        }
      });
    });
  }

  processAttributes(tmpl, states, localAttrs, handlersMapKey) {
    localAttrs.forEach((localAttr) => {
      tmpl.content.querySelectorAll(`[${localAttr}]`).forEach((elem) => {
        const state = states[Number(elem.getAttribute(localAttr))];
        if (localAttr.startsWith('on') && localAttr in window) {
          elem.removeAttribute(localAttr);
          elem.addEventListener(localAttr.slice(2), state);
          return;
        }
        const value = state?.();
        let attr = this.attrs.pop();
        while (attr) {
          const handlerItems = this.handlersMap
                  .get(handlersMapKey)
                  .get(attr);
          const handler = (v = state()) => {
            const newAttrValue = v;
            this.setAttribute.call(elem, localAttr, newAttrValue);
          };
          if (!handlerItems) {
            this.handlersMap
                    .get(handlersMapKey)
                    .set(attr, [handler]);
          } else {
            handlerItems.push(handler);
          }
          attr = this.attrs.pop();
          handler(value);
        }
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
    tmpl.content.querySelectorAll('slot').forEach((slot) => {
      const elems = this.slotsData.get(slot.getAttribute('name'));
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
    console.log(this.handlersMap);
    this.handlersMap.forEach((value, key) => {
      debugger;
      if (!key.parentElement) {
        this.handlersMap.delete(key);
        return;
      }
      value.get(name)?.forEach((handler) => {
        console.count('handle');
        this.attrs = [];
        handler();
      });
    });
  }
}
