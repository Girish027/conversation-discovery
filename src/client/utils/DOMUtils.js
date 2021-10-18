import Assert from './Assert';
import TimerUtils from './TimerUtils';
import Extend from './Extend';
import ObjectUtils from './ObjectUtils';

class DOMUtils {
  trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
  }

  addStylesheet(id, cssText) {
    Assert.notEmpty(id, 'addStylesheet id');
    Assert.notEmpty(cssText, 'addStylesheet cssText');

    const el = this.createElement('style', {
      id,
      type: 'text/css'
    });

    try {
      if (el.styleSheet) {
        el.styleSheet.cssText = cssText;
      } else {
        el.appendChild(document.createTextNode(cssText));
      }
      document.head.appendChild(el);
    } catch (e) {
      console.log('DOMUtils.addStylesheet error: ', e);
    }
    return el;
  }

  get(id) {
    return document.getElementById(id);
  }

  createElement(tag, attr = {}, children = []) {
    const el = document.createElement(tag);
    Object.keys(attr).map((key) => {
      el.setAttribute(key, attr[key]);
      return 0;
    });

    if (typeof children === 'string') {
      el.innerHTML = children;
    } else {
      children.map((child) => el.appendChild(child));
    }
    return el;
  }

  removeElement(el) {
    let _el = el;
    if (typeof _el === 'string') {
      _el = this.get(_el);
    }
    if (_el) {
      _el.parentNode.removeChild(_el);
    }
  }

  addClass(el, name) {
    const _name = this.trim(name);
    let _el = el;
    if (!_el) {
      return;
    }
    if (typeof _el === 'string') {
      _el = this.get(_el);
    }
    if (_el.classList) {
      _el.classList.add(_name);
    } else {
      _el.className += ` ${_name}`;
    }
  }

  removeClass(el, name) {
    const _name = this.trim(name);
    let _el = el;
    if (!_el) {
      return;
    }
    if (typeof _el === 'string') {
      _el = this.get(_el);
    }
    if (_el.classList) {
      _el.classList.remove(name);
    } else {
      _el.className = _el.className.replace(new RegExp(`(^|\\b)(\\s*)${_name.split(' ').join('(\\s*)|(\\s*)')}(\\s*)(\\b|$)`, 'g'), ' ');
    }
  }

  hasClass(el, name) {
    const _name = this.trim(name);
    let _el = el;
    if (typeof _el === 'string') {
      _el = this.get(_el);
    }
    if (_el.classList) {
      return _el.classList.contains(_name);
    }
    return new RegExp(`(^| )${_name}( |$)`, 'gi').test(_el.className);
  }

  hasSelector(elContent, selector) {
    const elem = (typeof elContent === 'string') ? this.createElement('div', undefined, elContent) : elContent;
    const result = elem.querySelectorAll(selector);

    return result.length > 0;
  }

  hide(el) {
    let _el = el;
    if (typeof _el === 'string') {
      _el = this.get(_el);
    }
    _el.style.display = 'none';
  }

  show(el) {
    let _el = el;
    if (typeof _el === 'string') {
      _el = this.get(_el);
    }
    _el.style.display = 'block';
  }

  getStyle(element, property) {
    return window.getComputedStyle(element)[property];
  }

  set(el, prop, value) {
    const _el = el;
    if (_el && typeof prop === 'string' && typeof value === 'string') {
      _el.style[prop] = value;
    }
  }

  /**
   * Sets css style for the provided element
   * @param {HTMLElement} element Element for which style has to be set
   * @param {(Object|String)} style CSS properties provided as cssText or key-value pairs object
   * @param {Boolean} [shouldClear=false] Reset existing inline styles before applying new
   * @returns {undefined}
   */
  setStyle(element, style, shouldClear = false) {
    if (!element) {
      return;
    }
    if (shouldClear) {
      element.setAttribute('style', '');
    }
    switch (typeof style) {
      case 'object':
        Object.keys(style).map((prop) => {
          if (Object.prototype.hasOwnProperty.call(style, prop)) {
            this.set(element, prop, style[prop]);
          }
          return 0;
        });
        break;
      case 'string':
        element.setAttribute('style', element.style.cssText + style);
        break;
      default:
        break;
    }
  }

  injectScript(url, onload = () => {}, doc, attr, timeout) {
    Assert.notEmpty(url, 'injectScript url');
    Assert.isNotUndefinedOrNull(doc.head, 'document.head');

    let done = false;
    if (!this.get(attr.id)) {
      console.log('Dynamically adding the script with source : ', url);
      const script = this.createElement('script', Extend({}, attr, {
        async: true,
        src: url,
        type: 'text/javascript'
      }));
      doc.head.appendChild(script);
      let tid;
      script.onreadystatechange = () => {
        if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
          done = true;
          if (tid) {
            TimerUtils.clearRequestTimeout(tid);
          }
          onload('success');

          // Handle memory leak in IE
          script.onreadystatechange = null;
        }
      };
      script.onload = () => {
        if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
          done = true;
          if (tid) {
            TimerUtils.clearRequestTimeout(tid);
          }
          onload('success');

          // Handle memory leak in IE
          script.onload = null;
        }
      };
      script.onerror = () => {
        script.onreadystatechange = null;
        script.onload = null;
        if (tid) {
          TimerUtils.clearRequestTimeout(tid);
        }
        onload('error');
      };
      if (timeout) {
        tid = TimerUtils.requestTimeout(() => {
          script.onreadystatechange = null;
          script.onload = null;
          onload('timeout');
        }, timeout);
      }
    } else {
      // script exists
      console.log('Script exists: ', url);
      onload('success');
    }
  }

  /**
   * reduceTags
   * @param  {string} string Input string
   * @param  {Array} allowedTags Allowed tags array
   * @param  {Object} allowedAttributes Allowed attributes map of tag to attributes array
   * @param  {Array} specialTags Tags which need to be flushed completely
   * @return {string} Reduced tags html string
   */
  reduceTags(string, allowedTags = [], allowedAttributes = {}, purgeTags = []) {
    Assert.isArray(allowedTags, 'reduceTags allowedTags');
    Assert.isObject(allowedAttributes, 'reduceTags allowedAttributes');
    Assert.isArray(purgeTags, 'reduceTags purgeTags');

    const dummyElement = this.createElement('div', {}, string);
    const childCollection = dummyElement.childNodes;
    const filteredString = [];

    if (childCollection.length > 0) {
      for (let i = 0; i < childCollection.length; i += 1) {
        let node = childCollection[i];
        const nodeName = node.nodeName.toLowerCase();
        node = !Array.isArray(allowedAttributes[nodeName])
          ? this.removeAttrs(node, [])
          : this.removeAttrs(node, allowedAttributes[nodeName]);
        if (node.hasChildNodes() && purgeTags.indexOf(nodeName) === -1) {
          if (node.childNodes.length === 1 && node.childNodes[0].nodeName === '#text') {
            if (allowedTags.indexOf(nodeName) > -1) {
              filteredString.push(node.outerHTML);
            } else {
              filteredString.push(node.textContent);
            }
          } else {
            const tagPositionOpen = node.innerHTML.indexOf('<');
            let partialPreText = '';
            if (tagPositionOpen > 0) {
              partialPreText = node.innerHTML.substr(0, tagPositionOpen);
              node.innerHTML = node.innerHTML.substr(tagPositionOpen);
            }
            const tagPositionClose = node.innerHTML.lastIndexOf('>');
            let partialPostText = '';
            partialPostText = node.innerHTML.substr(tagPositionClose + 1);
            node.innerHTML = node.innerHTML.substr(0, tagPositionClose + 1);
            if (allowedTags.indexOf(nodeName) > -1) {
              node.innerHTML = partialPreText + this.reduceTags(node.innerHTML, allowedTags, allowedAttributes, purgeTags) + partialPostText;
              filteredString.push(node.outerHTML);
            } else {
              filteredString.push(partialPreText + this.reduceTags(node.innerHTML, allowedTags, allowedAttributes, purgeTags) + partialPostText);
            }
          }
        } else {
          const currentTag = nodeName;
          if (purgeTags.indexOf(currentTag) === -1) {
            if (allowedTags.indexOf(currentTag) > -1) {
              filteredString.push(node.outerHTML);
            } else {
              filteredString.push(node.textContent);
            }
          }
        }
      }
    } else {
      filteredString.push(string);
    }

    return filteredString.join(' ').trim();
  }

  removeAttrs(element, allowedAttributes) {
    const el = element;
    if (el.attributes) {
      const attrs = el.attributes;
      for (let i = attrs.length - 1; i >= 0; i -= 1) {
        if (allowedAttributes.indexOf(attrs[i].name) === -1) {
          el.removeAttribute(attrs[i].name);
        }
      }
    }
    return el;
  }

  removeCSSProp(styleStr, allowedProps) {
    const str = styleStr;
    const matches = str.match(/([^\s{]+?(?=:))(:\s)([^;]*);/g);
    let cleanStr = '';
    if (matches) {
      matches.forEach((item) => {
        const prop = item.split(':')[0];
        if (allowedProps.indexOf(prop) > -1) {
          cleanStr += item;
        }
      });
    }
    return cleanStr;
  }

  fixAnchorTarget(string) {
    const dummyEl = this.createElement('div', {}, string);
    const elList = dummyEl.getElementsByTagName('a');
    let filteredString;

    if (elList.length > 0) {
      for (let i = 0; i < elList.length; i += 1) {
        const target = elList[i].getAttribute('target');
        if (ObjectUtils.isEmptyOrNull(target)) {
          elList[i].setAttribute('target', '_blank');
        }
      }
      filteredString = dummyEl.innerHTML;
    } else {
      filteredString = string;
    }

    return filteredString;
  }

  filterAttrOfTag(string, tag, attributes) {
    const dummyElement = this.createElement('div', {}, string);
    const elementCollection = dummyElement.getElementsByTagName(tag);
    const tagAttributes = [];
    let residueContent;

    const elementArray = [].slice.call(elementCollection);

    if (elementArray.length === 0) {
      residueContent = dummyElement.innerHTML;
      return { residueContent };
    }

    elementArray.map((element) => {
      const attributeObj = {};

      attributes.map((attribute) => {
        const elementValue = (!ObjectUtils.isEmptyOrNull(element.getAttribute(attribute)))
          ? element.getAttribute(attribute).trim()
          : element.getAttribute(attribute);
        attributeObj[attribute] = (!ObjectUtils.isEmptyOrNull(element.dataset)
          && !ObjectUtils.isEmptyOrNull(element.dataset[attribute]))
          ? element.dataset[attribute].trim()
          : elementValue;
        return 0;
      });
      attributeObj.innerHTML = element.innerHTML.trim();

      tagAttributes.push(attributeObj);
      this.removeElement(element);
      return 0;
    });

    if ((tagAttributes.length > 0
      && dummyElement.textContent.trim() === '')
      && dummyElement.getElementsByTagName('img').length === 0) {
      residueContent = undefined;
    } else {
      residueContent = dummyElement.innerHTML;
    }

    return { residueContent, tagAttributes };
  }

  redrawElement(element, style1, style2) {
    if (!element) {
      return 0;
    }
    this.setStyle(element, style1);
    TimerUtils.requestTimeout(() => {
      this.setStyle(element, style2);
    }, 40);
    return 0;
  }

  matches(el, selector) {
    const matches = (el.document || el.ownerDocument).querySelectorAll(selector);
    let i = matches.length;
    while (i >= 0 && matches.item(i) !== el) {
      i -= 1;
    }
    return i > -1;
  }
}

export default new DOMUtils();
