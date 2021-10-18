import chai, {
  expect
} from 'chai';

import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import TimerUtils from '../TimerUtils';
import DOMUtils from '../DOMUtils';

chai.use(sinonChai);
const sandbox = sinon.createSandbox();

describe('DOMUtils', () => {
  afterEach(() => {
    sandbox.restore();
  });

  describe('trim:', () => {
    it('should replace aleading and trailing spaces', () => {
      const inputStr = ' Hello, how are you ?     ';
      expect(DOMUtils.trim(inputStr)).to.equal('Hello, how are you ?');
    });
  });

  describe('addStylesheet:', () => {
    it('should create style element', () => {
      const style = DOMUtils.addStylesheet('unique-id', '.some-class{position: absolute;}');
      expect(style.tagName).to.equal('STYLE');
      expect(style.innerHTML).to.equal('.some-class{position: absolute;}');
      expect(style.id).to.equal('unique-id');
    });

    it('should throw error on empty id', () => {
      expect(() => {
        DOMUtils.addStylesheet(undefined, '.some-class{position: absolute;}');
      }).to.throw('addStylesheet id is not a string or is empty');
    });

    it('should throw error on empty cssText', () => {
      expect(() => {
        DOMUtils.addStylesheet('unique-id');
      }).to.throw('addStylesheet cssText is not a string or is empty');
    });
  });

  describe('createElement:', () => {
    it('should create HTML element for given tag', () => {
      expect(DOMUtils.createElement('div').tagName).to.equal('DIV');
      expect(DOMUtils.createElement('a').tagName).to.equal('A');
      expect(DOMUtils.createElement('li').tagName).to.equal('LI');
    });

    it('should set the passed attributes for the HTML element', () => {
      const elem = DOMUtils.createElement('div', {
        draggable: true,
        title: 'Test element'
      });
      expect(elem.tagName).to.equal('DIV');
      expect(elem.getAttribute('draggable')).to.equal('true');
      expect(elem.getAttribute('title')).to.equal('Test element');
    });

    it('should set the passed children (when they are string) as innerHTML ', () => {
      const elem = DOMUtils.createElement('div', {
        draggable: true,
        title: 'Test element'
      }, 'This is a div');
      expect(elem.innerHTML).to.equal('This is a div');
    });

    it('should append all the child elements to the newly created element', () => {
      const children = [DOMUtils.createElement('p', {}, 'child 1'), DOMUtils.createElement('p', {}, 'child 2')];
      const elem = DOMUtils.createElement('div', {
        draggable: true,
        title: 'Test element'
      }, children);
      expect(elem.innerHTML).to.equal('<p>child 1</p><p>child 2</p>');
    });
  });

  describe('removeElement:', () => {
    let elem;
    let child2;
    beforeAll(() => {
      child2 = DOMUtils.createElement('p', {
        id: 'child2'
      }, 'child 2');
      const children = [
        DOMUtils.createElement('p', {
          id: 'child1'
        }, 'child 1'),
        child2
      ];
      elem = DOMUtils.createElement('div', {
        draggable: true,
        title: 'Test element',
        id: 'toBeRemoved'
      }, children);
      document.body.appendChild(elem);
    });

    afterAll(() => {
      DOMUtils.removeElement('toBeRemoved');
    });

    it('should remove the element with the given id', () => {
      expect(document.getElementById('child1')).to.exist;
      DOMUtils.removeElement('child1');
      expect(document.getElementById('child1')).to.not.exist;
    });

    it('should not try to remove the element if it is not present', () => {
      expect(document.getElementById('not present')).to.not.exist;
      expect(() => DOMUtils.removeElement('not present')).to.not.throw;
    });

    it('should remove the given element', () => {
      expect(document.getElementById(child2.id)).to.exist;
      DOMUtils.removeElement(child2);
      expect(document.getElementById(child2.id)).to.not.exist;
    });
  });

  describe('addClass, removeClass, hasClass:', () => {
    let elem;
    let element;

    beforeEach(() => {
      DOMUtils.removeElement('toBeRemoved');
      elem = DOMUtils.createElement('div', {
        title: 'Test element',
        id: 'toBeRemoved',
        class: 'class1 class2 class3',
        style: 'height: 30px; display: block;' // eslint-disable-line react/style-prop-object
      });
      document.body.appendChild(elem);

      // mock element without classList support for testing that scenario
      element = {
        className: 'class1 class2 class3'
      };
    });

    it('addClass: should not try to add class for an undefined element', () => {
      expect(DOMUtils.addClass(document.getElementById('not present'), '  class4')).to.be.undefined;
    });

    it('addClass: should add class to the given element', () => {
      DOMUtils.addClass(elem, 'newClass2');
      expect(elem.classList.value).to.contain('newClass2');
    });

    it('addClass: should add class to the given element (classList undefined)', () => {
      DOMUtils.addClass(element, 'newClass2');
      expect(element.className).to.contain('newClass2');
    });

    it('addClass: should add class to the given element (with id)', () => {
      DOMUtils.addClass('toBeRemoved', 'newClass2');
      expect(elem.className).to.contain('newClass2');
    });

    it('removeClass: should not try to remove class for an undefined element', () => {
      expect(DOMUtils.removeClass(document.getElementById('not present'), 'class4')).to.be.undefined;
    });

    it('removeClass: should remove class to the given element', () => {
      DOMUtils.removeClass(element, 'class3');
      expect(element.className).to.not.contain('class3');
    });

    it('removeClass: should remove class to the given element (classList undefined)', () => {
      DOMUtils.removeClass(elem, 'class3');
      expect(elem.classList.value).to.not.contain('class3');
    });

    it('removeClass: should remove class to the given element (with id)', () => {
      DOMUtils.removeClass('toBeRemoved', 'class3');
      expect(elem.className).to.not.contain('class3');
    });

    it('hasClass: should find whether the given class is present for the element', () => {
      expect(DOMUtils.hasClass(elem, '  class1')).to.be.true;
      expect(DOMUtils.hasClass(elem, 'unknown')).to.be.false;
    });

    it('hasClass: should find whether the given class is present for the element (classList undefined)', () => {
      expect(DOMUtils.hasClass(element, '  class1')).to.be.true;
      expect(DOMUtils.hasClass(element, 'unknown')).to.be.false;
    });

    it('hasClass: should find whether the given class is present for the element (with id)', () => {
      expect(DOMUtils.hasClass('toBeRemoved', '  class1')).to.be.true;
      expect(DOMUtils.hasClass('toBeRemoved', 'unknown')).to.be.false;
    });
  });

  describe('Style:', () => {
    let elem;

    beforeEach(() => {
      DOMUtils.removeElement('toBeRemoved');
      elem = DOMUtils.createElement('div', {
        title: 'Test element',
        id: 'toBeRemoved',
        class: 'class1 class2 class3',
        style: 'height: 30px; display: block;' // eslint-disable-line react/style-prop-object
      });
      document.body.appendChild(elem);
    });

    it('hide: should hide the element', () => {
      DOMUtils.hide(elem);
      expect(DOMUtils.getStyle(elem, 'display')).to.equal('none');
    });

    it('hide: should hide the element (with id)', () => {
      DOMUtils.hide('toBeRemoved');
      expect(DOMUtils.getStyle(elem, 'display')).to.equal('none');
    });

    it('show: should show the element', () => {
      DOMUtils.show(elem);
      expect(DOMUtils.getStyle(elem, 'display')).to.equal('block');
    });

    it('show: should show the element (with id)', () => {
      DOMUtils.show('toBeRemoved');
      expect(DOMUtils.getStyle(elem, 'display')).to.equal('block');
    });

    it('getStyle: should get style for the given property for the element', () => {
      DOMUtils.set(elem, 'height', '30px');
      expect(DOMUtils.getStyle(elem, 'height')).to.equal('30px');
    });

    it('set: should add to the style attribute for string values', () => {
      DOMUtils.set(elem, 'width', '20px');
      expect(DOMUtils.getStyle(elem, 'width')).to.equal('20px');
    });

    it('set: should not add to the style attribute for invalid values', () => {
      DOMUtils.set(elem, 'width', 10);
      expect(DOMUtils.getStyle(elem, 'width')).to.not.equal(10);
    });

    it('setStyle: should not try to change style for an undefined element', () => {
      expect(DOMUtils.setStyle(document.getElementById('not present'))).to.be.undefined;
    });

    it('setStyle: should remove the existing style attributes for the element', () => {
      expect(DOMUtils.getStyle(elem, 'height')).to.not.be.empty;
      DOMUtils.setStyle(elem, undefined, true);
      expect(DOMUtils.getStyle(elem, 'height')).to.be.empty;
    });

    it('setStyle: should add the new style propterties to the element', () => {
      DOMUtils.setStyle(elem, {
        backgroundColor: 'rgb(238, 238, 238)',
        opacity: '0.5'
      }, true);
      expect(DOMUtils.getStyle(elem, 'backgroundColor')).to.equal('rgb(238, 238, 238)');
      expect(DOMUtils.getStyle(elem, 'opacity')).to.equal('0.5');
    });

    it('setStyle: should add the new style propterties to the element\'s existing style', () => {
      DOMUtils.setStyle(elem, 'width:20px', true);
      DOMUtils.setStyle(elem, 'padding:2px', false);
      expect(DOMUtils.getStyle(elem, 'width')).to.equal('20px');
      expect(DOMUtils.getStyle(elem, 'padding')).to.equal('2px');
    });
  });

  describe('injectScript:', () => {
    let container;
    let clock;

    beforeAll(() => {
      container = document;
      container.body.appendChild(DOMUtils.createElement('p', {
        id: 'child'
      }));
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      DOMUtils.removeElement('script1');
    });

    afterAll(() => {
      clock.restore();
    });

    it('should not inject if an element with id is already present', () => {
      const logSpy = sandbox.stub(console, 'log');
      DOMUtils.injectScript('fake/url', undefined, container, {
        id: 'child'
      }, 2000);
      expect(logSpy).to.be.called;
    });

    it('should inject the script dynamically', () => {
      const onload = sandbox.stub();
      expect(document.getElementById('script1')).to.not.exist;
      DOMUtils.injectScript('./dummyScript.js', onload, container, {
        id: 'script1'
      }, 100);
      clock.tick(110);
      expect(document.getElementById('script1')).to.exist;
    });

    it('should handle the onreadystatechange of the injected script', () => {
      const onload = sandbox.stub();

      DOMUtils.injectScript('./dummyScript.js', onload, container, {
        id: 'script1'
      });
      expect(document.getElementById('script1')).to.exist;
      const scriptElement = document.getElementById('script1');
      scriptElement.onreadystatechange();
      expect(scriptElement.onreadystatechange).to.be.null;
    });

    it('should handle the onreadystatechange of the injected script - clear timeout if present', () => {
      const clearRequestTimeoutSpy = sandbox.spy(TimerUtils, 'clearRequestTimeout');
      const onload = sandbox.stub();
      onload.callsFake(() => {
        expect(clearRequestTimeoutSpy).to.be.called;
      });
      DOMUtils.injectScript('./dummyScript.js', onload, container, {
        id: 'script1'
      }, 1000);
      expect(document.getElementById('script1')).to.exist;
      const scriptElement = document.getElementById('script1');
      scriptElement.onreadystatechange();
    });

    it('should handle the onload of the injected script', () => {
      const onload = sandbox.stub();
      expect(document.getElementById('script1')).to.not.exist;

      DOMUtils.injectScript('./dummyScript.js', onload, container, {
        id: 'script1'
      });
      expect(document.getElementById('script1')).to.exist;
      const scriptElement = document.getElementById('script1');
      scriptElement.onload();
      expect(scriptElement.onload).to.be.null;
    });

    it('should handle the onreadystatechange of the injected script - clear timeout if present', () => {
      const clearRequestTimeoutSpy = sandbox.spy(TimerUtils, 'clearRequestTimeout');
      const onload = sandbox.stub();
      onload.callsFake(() => {
        expect(clearRequestTimeoutSpy).to.be.called;
      });

      DOMUtils.injectScript('./dummyScript.js', onload, container, {
        id: 'script1'
      }, 1000);
      expect(document.getElementById('script1')).to.exist;
      const scriptElement = document.getElementById('script1');
      scriptElement.onload();
    });
  });

  describe('reduceTags', () => {
    it('should return text, if plain text is sent', () => {
      const inputStr = 'Hello, this is a plain text!';
      const outputStr = DOMUtils.reduceTags(inputStr);
      expect(outputStr).to.equal(inputStr);
    });

    it('should return text, if plain text is sent along with list of allowed tag: div, img, a', () => {
      const inputStr = 'Hello, this is a plain text!';
      const outputStr = DOMUtils.reduceTags(inputStr, ['div', 'img', 'a']);
      expect(outputStr).to.equal(inputStr);
    });

    it('should reduce all the tags if no list of allowed tags are mentioned', () => {
      const inputStr = '<div>Hello, this is text inside div tag.</div>'
        + '<div><p> This is text inside nested tag</p></div>';
      const outputStr = DOMUtils.reduceTags(inputStr);
      const expectedOutput = 'Hello, this is text inside div tag. This is text inside nested tag';
      expect(outputStr).to.equal(expectedOutput);
    });

    it('should allow only the specified tag and no other tags', () => {
      const inputStr = '<div>Hello, this is text inside div tag.</div>'
        + '<div><p> This is text inside nested tag</p></div>';
      const outputStr = DOMUtils.reduceTags(inputStr, ['p']);
      const expectedOutput = 'Hello, this is text inside div tag. <p> This is text inside nested tag</p>';
      expect(outputStr).to.equal(expectedOutput);
    });

    it('should allow the img tag when that is sent and is part of the allowed tags', () => {
      const inputStr = '<div>Hello, this is text inside div tag.</div>'
        + '<div><p> This is text inside nested tag. </p></div>'
        + '<img height="100px" title="sample title" src="sample-src">';
      const outputStr = DOMUtils.reduceTags(inputStr, ['img']);
      const expectedOutput = 'Hello, this is text inside div tag. This is text inside nested tag. '
        + '<img>';
      expect(outputStr).to.equal(expectedOutput);
    });

    it('should purge the listed tags from the html string', () => {
      const inputStr = '<div>Hello, this is text inside div tag.</div>'
        + '<div><p> This is text inside nested tag. </p></div>'
        + '<img height="100px" title="sample title" src="sample-src">';
      const outputStr = DOMUtils.reduceTags(inputStr, undefined, undefined, ['p', 'img']);
      const expectedOutput = 'Hello, this is text inside div tag.';
      expect(outputStr).to.equal(expectedOutput);
    });

    it('should keep only the allowed attributes for specified elements', () => {
      const inputStr = '<div dir="ltr" draggable="true" id="test1">text inside div tag.</div>'
        + '<div><p draggable="true" id="test2">text inside nested tag. </p></div>'
        + '<img height="100px" title="sample title" src="sample-src">';
      const outputStr = DOMUtils.reduceTags(inputStr, ['div', 'p'], {
        div: ['draggable', 'id'],
        p: ['id']
      });
      const expectedOutput = '<div draggable="true" id="test1">text inside div tag.</div>'
        + ' <div><p id="test2">text inside nested tag. </p></div>';
      expect(outputStr).to.equal(expectedOutput);
    });

    it('should handle partial pretext and partial posttext outside of all nodes', () => {
      const inputStr = 'this is a partial text.</div> <div>Hello, this is text inside div tag.</div>'
        + '<div><p> This is text inside nested tag. </p></div>'
        + '<img height="100px" title="sample title" src="sample-src"> post text';
      const outputStr = DOMUtils.reduceTags(inputStr, undefined, undefined, ['p', 'img']);
      // const expectedOutput = 'Hello, this is text inside div tag.';
      const expectedOutput = 'this is a partial text.  Hello, this is text inside div tag.   post text';
      expect(outputStr).to.equal(expectedOutput);
    });

    it('should handle partial pretext inside a node', () => {
      const inputStr = '<div>Pretext <p>and</p> Post text</div>';
      const outputStr = DOMUtils.reduceTags(inputStr);
      const expectedOutput = 'Pretext and Post text';
      expect(outputStr).to.equal(expectedOutput);
    });
  });

  describe('removeAttrs', () => {
    it('should remove style attribute if not present in allowedAttrs', () => {
      const inputEl = document.createElement('img');
      inputEl.setAttribute('style', 'position: fixed;');
      inputEl.setAttribute('title', 'sample-title');
      inputEl.setAttribute('src', 'sample-src');

      const outputEl = DOMUtils.removeAttrs(inputEl, ['title', 'src']);
      const expectedOutput = '<img title="sample-title" src="sample-src">';
      expect(outputEl.outerHTML).to.equal(expectedOutput);
    });

    it('should keep title and height attribute if present in allowedAttrs', () => {
      const inputEl = document.createElement('img');
      inputEl.setAttribute('style', 'position: fixed;');
      inputEl.setAttribute('title', 'sample-title');
      inputEl.setAttribute('height', '100%');

      const outputEl = DOMUtils.removeAttrs(inputEl, ['title', 'height']);
      const expectedOutput = '<img title="sample-title" height="100%">';
      expect(outputEl.outerHTML).to.equal(expectedOutput);
    });

    it('should return the element when no attributes are present', () => {
      const outputEl = DOMUtils.removeAttrs({
        id: 'test'
      }, ['title', 'height']);
      expect(outputEl).to.deep.equal({
        id: 'test'
      });
    });
  });

  describe('filterAttrOfTag', () => {
    it('should return img tag, if both button and img tag are part of the same string', () => {
      const inputStr = '<img title="sample-title" src="sample-src"><button name="eventname" value="sample-value">Test label</button>';
      const output = DOMUtils.filterAttrOfTag(inputStr, 'button', ['name', 'value']);
      const expectedOutput = '<img title="sample-title" src="sample-src">';
      expect(output.residueContent).to.equal(expectedOutput);
      expect(output.tagAttributes).to.be.an('array');
      expect(output.tagAttributes.length).to.be.equal(1);
      expect(output.tagAttributes[0]).to.include({
        name: 'eventname',
        value: 'sample-value',
        innerHTML: 'Test label'
      });
    });

    it('should return img tag, if img is sent along with other tags, different from button', () => {
      const inputStr = '<div>This is a test string</div><img title="sample-title" src="sample-src">';
      const output = DOMUtils.filterAttrOfTag(inputStr, 'button', ['name', 'value']);
      expect(output.residueContent).to.equal(inputStr);
      expect(output.tagAttributes).to.equal(undefined);
    });

    it('should return undefined residueContent, if only button tag is present in the string', () => {
      const inputStr = '<div><button name="eventname" value="test-value-1">Test label 1</button>'
        + '<button name="eventname" value="test-value-2">Test label 2</button></div>';
      const output = DOMUtils.filterAttrOfTag(inputStr, 'button', ['name', 'value']);
      expect(output.residueContent).to.equal(undefined);
      expect(output.tagAttributes).to.be.an('array');
      expect(output.tagAttributes.length).to.be.equal(2);
      expect(output.tagAttributes[0]).to.include({
        name: 'eventname',
        value: 'test-value-1',
        innerHTML: 'Test label 1'
      });
      expect(output.tagAttributes[1]).to.include({
        name: 'eventname',
        value: 'test-value-2',
        innerHTML: 'Test label 2'
      });
    });

    it('should return img tag and text both, if img, text and button is sent', () => {
      const inputStr = '<div>This is text inside div<button name="eventname" value="test-value-1">Test label 1</button>'
        + '<button name="eventname" value="test-value-2">Test label 2</button>'
        + '<img title="sample-title" src="sample-src"></div>';
      const output = DOMUtils.filterAttrOfTag(inputStr, 'button', ['name', 'value']);
      const expectedOutput = '<div>This is text inside div<img title="sample-title" src="sample-src"></div>';
      expect(output.residueContent).to.equal(expectedOutput);
      expect(output.tagAttributes).to.be.an('array');
      expect(output.tagAttributes.length).to.be.equal(2);
      expect(output.tagAttributes[0]).to.include({
        name: 'eventname',
        value: 'test-value-1',
        innerHTML: 'Test label 1'
      });
    });

    it('should return text, if text and button both are sent', () => {
      const inputStr = '<div>This is a test string</div><button name="eventname" value="test-value-1">Test label 1</button>';
      const output = DOMUtils.filterAttrOfTag(inputStr, 'button', ['name', 'value']);
      const expectedOutput = '<div>This is a test string</div>';
      expect(output.residueContent).to.equal(expectedOutput);
      expect(output.tagAttributes).to.be.an('array');
      expect(output.tagAttributes.length).to.be.equal(1);
      expect(output.tagAttributes[0]).to.include({
        name: 'eventname',
        value: 'test-value-1',
        innerHTML: 'Test label 1'
      });
    });

    it('should return style attribute for tags, if input has style attr', () => {
      const inputStr = '<div>This is a test string</div><button name="eventname" value="test-value-1">Test label 1<span style="height:0;">hidden text</span></button>';
      const output = DOMUtils.filterAttrOfTag(inputStr, 'button', ['name', 'value']);
      const expectedOutput = '<div>This is a test string</div>';
      expect(output.residueContent).to.equal(expectedOutput);
      expect(output.tagAttributes).to.be.an('array');
      expect(output.tagAttributes.length).to.be.equal(1);
      expect(output.tagAttributes[0]).to.include({
        name: 'eventname',
        value: 'test-value-1',
        innerHTML: 'Test label 1<span style="height:0;">hidden text</span>'
      });
    });
  });

  describe('fixAnchorTarget', () => {
    it('should add/modify target attribute with value = \'_blank\'to the anchor tags', () => {
      const list = `
        <p> list of links </p>
        <a href="https://test.com" target="_blank"> link1</a>
        <a href="https://test.com"> link2</a>
        <a href="https://test.com" target=""> link2</a>
        <a href="https://test.com" target="_top"> link3</a>`;
      const filteredString = DOMUtils.fixAnchorTarget(list);
      expect(((filteredString || '').match(/target="_blank"/g) || []).length).equal(3);
    });

    it('should not modify target attribute with value = \'_top\'to the anchor tags', () => {
      const list = `
        <a href="https://test.com" target="_top"> link3</a>`;
      const filteredString = DOMUtils.fixAnchorTarget(list);
      expect(((filteredString || '').match(/target="_top"/g) || []).length).equal(1);
    });

    it('should not modify input string if anchor tags are not present', () => {
      const input = '<p> empty list of links </p>';
      expect(DOMUtils.fixAnchorTarget(input)).to.equal(input);
    });
  });

  describe('redrawElement', () => {
    let requestTimeoutSpy;
    let setStyleStub;
    let clock;
    let element;

    beforeAll(() => {
      clock = sinon.useFakeTimers();
      element = document.createElement('div');
    });

    beforeEach(() => {
      requestTimeoutSpy = sandbox.spy(TimerUtils, 'requestTimeout');
      setStyleStub = sandbox.stub(DOMUtils, 'setStyle');
    });

    afterAll(() => {
      clock.restore();
    });

    it('should not try to draw an undefined element', () => {
      DOMUtils.redrawElement(undefined, {
        backgroundColor: 'rgb(238, 238, 238)',
        opacity: '0.5'
      }, {
        backgroundColor: 'rgb(238, 238, 238)',
        opacity: '1'
      });
      expect(setStyleStub).to.not.be.called;
    });

    it('should set the first style for the element before setting timeout for second style', () => {
      DOMUtils.redrawElement(element, {
        backgroundColor: 'rgb(238, 238, 238)',
        opacity: '0.5'
      }, {
        backgroundColor: 'rgb(238, 238, 238)',
        opacity: '1'
      });
      expect(setStyleStub).to.be.calledWith(element, {
        backgroundColor: 'rgb(238, 238, 238)',
        opacity: '0.5'
      });
      expect(requestTimeoutSpy).to.be.called;
      expect(setStyleStub.calledBefore(requestTimeoutSpy)).to.be.true;
    });

    it('should set thesecond style for the element after the timeout period', () => {
      DOMUtils.redrawElement(element, {
        backgroundColor: 'rgb(238, 238, 238)',
        opacity: '0.5'
      }, {
        backgroundColor: 'rgb(238, 238, 238)',
        opacity: '1'
      });

      expect(requestTimeoutSpy).to.be.called;
      expect(requestTimeoutSpy.getCall(0).args[1]).to.equal(40);
      clock.tick(42);
    });
  });
});