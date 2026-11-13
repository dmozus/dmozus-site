document.querySelectorAll('form[data-inquire]').forEach(function (f) {
  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var note = f.querySelector('.note'), btn = f.querySelector('button');
    var body = {
      name: f.elements.name.value,
      email: f.elements.email.value,
      message: 'About the original: ' + f.dataset.piece + '\n\n' + f.elements.message.value
    };
    btn.disabled = true; note.textContent = 'sending...';
    fetch(f.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw 0; f.reset(); note.textContent = 'Sent! I will write back soon.'; })
      .catch(function () { note.textContent = 'Could not send. Please try again.'; })
      .then(function () { btn.disabled = false; });
  });
});
