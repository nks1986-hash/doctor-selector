// frontend.js
// -------------------------------------------------------------
// Vanilla JS chatbot UI controller.
// Talks to POST /api/triage and renders the conversation.
// -------------------------------------------------------------

(() => {
  const messagesEl = document.getElementById('messages');
  const formEl = document.getElementById('chat-form');
  const inputEl = document.getElementById('symptom-input');
  const sendBtn = document.getElementById('send-btn');
  const quickEl = document.getElementById('symptom-quick');

  // Render a chat bubble. Returns the element so callers can update/remove it.
  function addBubble(role, text, opts = {}) {
    const el = document.createElement('div');
    el.className = `bubble ${role}` + (opts.typing ? ' typing' : '');
    el.textContent = text;
    if (opts.specialty) {
      const tag = document.createElement('span');
      tag.className = 'specialty';
      tag.textContent = opts.specialty;
      el.appendChild(document.createElement('br'));
      el.appendChild(tag);
    }
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  // Greet the patient once on load.
  addBubble(
    'bot',
    "Hi! I'm your triage assistant. Tell me what symptoms you're experiencing and I'll suggest the right kind of doctor."
  );

  // Quick-select dropdown -> populate the input box.
  quickEl.addEventListener('change', () => {
    if (quickEl.value) {
      inputEl.value = quickEl.value;
      inputEl.focus();
      quickEl.selectedIndex = 0;
    }
  });

  // Submit handler: send symptoms to the backend and render the reply.
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const symptoms = inputEl.value.trim();
    if (!symptoms) return;

    addBubble('user', symptoms);
    inputEl.value = '';
    sendBtn.disabled = true;

    const typingEl = addBubble('bot', 'Analyzing your symptoms…', {
      typing: true,
    });

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();

      typingEl.remove();

      if (!res.ok) {
        addBubble('bot', data.error || 'Something went wrong. Please try again.');
      } else {
        addBubble('bot', data.message, { specialty: data.specialty });
      }
    } catch (err) {
      typingEl.remove();
      addBubble(
        'bot',
        'Network error — please check your connection and try again.'
      );
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  });
})();
