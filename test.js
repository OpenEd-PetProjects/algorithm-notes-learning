const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('app.js', 'utf8');

function setup(initial = null, failWrite = false) {
  let saved = initial;
  const elements = Object.fromEntries(['note-form', 'title', 'text', 'notes', 'message'].map(id => [id, {}]));
  const form = elements['note-form'];
  form.addEventListener = (_, fn) => { form.submit = fn; };
  form.reset = () => { elements.title.value = ''; elements.text.value = ''; };
  elements.title.focus = () => {};
  elements.notes.replaceChildren = (...items) => { elements.notes.items = items; };
  const document = { querySelector: selector => elements[selector.slice(1)], createElement: () => ({ append(...children) { this.children = children; } }) };
  const localStorage = { getItem: () => saved, setItem: (_, value) => { if (failWrite) throw Error(); saved = value; } };
  vm.runInNewContext(code, { document, localStorage });
  return { elements, add(title, text) { elements.title.value = title; elements.text.value = text; form.submit({ preventDefault() {} }); }, saved: () => saved };
}

const app = setup();
app.add('BFS', '<b>Поиск в ширину</b>');
assert.equal(app.elements.notes.items.length, 1);
assert.equal(app.elements.notes.items[0].children[1].textContent, '<b>Поиск в ширину</b>');
assert.equal(setup(app.saved()).elements.notes.items.length, 1);
app.add('  ', 'текст');
app.add('название', '  ');
assert.equal(app.elements.notes.items.length, 1);
const invalid = setup('{broken');
invalid.add('BFS', 'текст');
assert.equal(invalid.saved(), '{broken');
const failed = setup(null, true);
failed.add('BFS', 'текст');
assert.equal(failed.elements.notes.items.length, 0);
assert.ok(failed.elements.message.textContent);
