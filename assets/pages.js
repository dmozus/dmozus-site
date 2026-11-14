document.querySelectorAll('form[data-inquire]').forEach(function (f) {
  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var note = f.querySelector('.note'), btn = f.querySelector('button');
    var body = {
      name: f.elements.name.value,
      email: f.elements.email.value,
      message: f.elements.message.value + '\n\n(Sent from the page for ' + f.dataset.piece + ')'
    };
    btn.disabled = true; note.textContent = 'sending...';
    fetch(f.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw 0; try { if (window.umami) window.umami.track('Original inquiry sent', { piece: f.dataset.piece }); } catch (e) {} f.reset(); note.textContent = 'Sent! I will write back soon.'; })
      .catch(function () { note.textContent = 'Could not send. Please try again.'; })
      .then(function () { btn.disabled = false; });
  });
});
