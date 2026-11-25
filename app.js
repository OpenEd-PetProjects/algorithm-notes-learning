const form = document.querySelector('#note-form');
const title = document.querySelector('#title');
const text = document.querySelector('#text');
const list = document.querySelector('#notes');
const message = document.querySelector('#message');
let notes = [];
let storageAvailable = true;

try {
  const saved = JSON.parse(localStorage.getItem('algorithm-notes') || '[]');
  if (!Array.isArray(saved) || !saved.every(note => note && typeof note.title === 'string' && typeof note.text === 'string')) throw new Error('Invalid data');
  notes = saved;
} catch {
  storageAvailable = false;
  message.textContent = 'Не удалось прочитать сохранённые заметки. Добавление отключено, чтобы не перезаписать данные.';
}

function render() {
  list.replaceChildren(...notes.map((note, index) => {
    const item = document.createElement('li');
    const heading = document.createElement('strong');
    const content = document.createElement('p');
    const remove = document.createElement('button');
    heading.textContent = note.title;
    content.textContent = note.text;
    remove.type = 'button';
    remove.textContent = 'Удалить';
    remove.setAttribute('aria-label', `Удалить заметку: ${note.title}`);
    remove.addEventListener('click', () => {
      const updated = notes.filter((_, i) => i !== index);
      try {
        localStorage.setItem('algorithm-notes', JSON.stringify(updated));
      } catch {
        message.textContent = 'Не удалось удалить заметку. Проверьте доступность хранилища браузера.';
        return;
      }
      notes = updated;
      message.textContent = '';
      render();
    });
    item.append(heading, content, remove);
    return item;
  }));
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = title.value.trim();
  const content = text.value.trim();
  if (!name || !content || !storageAvailable) return;
  const updated = [...notes, { title: name, text: content }];
  try {
    localStorage.setItem('algorithm-notes', JSON.stringify(updated));
  } catch {
    message.textContent = 'Не удалось сохранить заметку. Проверьте доступность хранилища браузера.';
    return;
  }
  notes = updated;
  message.textContent = '';
  render();
  form.reset();
  title.focus();
});

render();
