export class CustomElements extends HTMLElement {
  attrs = [];
  states = [];
  attrsMap = new Map();

  html(strings, ...replacements) {
    const result = strings.reduce((acc, str, idx) => {
      const replace = replacements[idx];
      if (!replace) {
        return `${acc}${str}`;
      }
      if (!(typeof replace === 'function')) {
        return `${acc}${str}"${replace}"`;
      }
      // const attrName = str.match(/([\w-]+)=$/)?.[1];
      // const cell = this.attrs.reduce((acc, attr) => acc + '$' + attr, '');
      // const giglet = attrName ? `${cell}` : `<!-- ${cell} -->`;
      this.states.push(replace);
      return `${acc}${str}<!-- $${this.states.length - 1} -->`;
    }, '');
    const tmpl = document.createElement('template');
    tmpl.innerHTML = result;
    const comments = this.findComments(tmpl.content);
    comments.forEach((comment) => {
      comment.parentElement.childNodes.forEach((node, idx, parent) => {
        if (node === comment) {
          this.attrs = [];
          const cb = this.states[comment.nodeValue.match(/\d+/)?.[0]];
          const res = cb?.();
          this.attrs.forEach((attr) => {
            const cbs = this.attrsMap.get(attr);
            const f = () => {
              parent[idx].replaceWith(cb());
            };
            if (!cbs) {
              this.attrsMap.set(attr, [f]);
            } else {
              cbs.push(f);
            }
            f();
          });
        }
      });
    });
    /* comments[0].parentElement.childNodes.forEach((n, idx, parent) => {
      if (n.nodeType === Node.COMMENT_NODE) {
        const div = document.createElement('div')
        div.innerHTML = 'dsadsad asdl kjas';
        n.replaceWith('ahah');
      }
    }); */
    this.innerHTML = '';
    this.append(tmpl.content);
  }

  effect(attr) {
    this.attrs.push(attr);
    return this.getAttribute(attr);
  }

  attributeChangedCallback(name) {
    this.attrsMap.get(name)?.forEach((f) => {
      f();
    });
  }

  findComments(element) {
    const comments = [];
    const iterator = document.createNodeIterator(
      element,
      NodeFilter.SHOW_COMMENT,
      () => NodeFilter.FILTER_ACCEPT,
      false
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
}
