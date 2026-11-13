document.querySelectorAll('form[data-inquire]').forEach(function (f) {
  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var note = f.querySelector('.note'), btn = f.querySelector('button');
    btn.disabled = true; note.textContent = 'sending...';
    fetch(f.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) })
      .then(function (r) { if (!r.ok) throw 0; f.reset(); note.textContent = 'Sent! I will write back soon.'; })
      .catch(function () { note.textContent = 'Could not send. Please try again.'; })
      .then(function () { btn.disabled = false; });
  });
});
