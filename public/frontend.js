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

  // Render the list of recommended doctors with a "Book" action.
  function addDoctorList(specialty, doctors) {
    if (!Array.isArray(doctors) || doctors.length === 0) return;

    const wrap = document.createElement('div');
    wrap.className = 'bubble bot doctor-list';

    const heading = document.createElement('div');
    heading.className = 'doctor-heading';
    heading.textContent = `Available ${specialty}s you can book:`;
    wrap.appendChild(heading);

    doctors.forEach((doc) => {
      const card = document.createElement('div');
      card.className = 'doctor-card';

      const info = document.createElement('div');
      info.className = 'doctor-info';
      info.innerHTML =
        `<strong>${doc.name}</strong>` +
        `<span class="doctor-meta">${doc.hospital} \u2022 ${doc.experience}</span>` +
        `<span class="doctor-fee">Consultation fee: \u20B9${doc.fee}</span>`;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'book-btn';
      btn.textContent = 'Book';
      btn.addEventListener('click', () => {
        btn.disabled = true;
        btn.textContent = 'Booked \u2713';
        addBubble(
          'bot',
          `Appointment request sent for ${doc.name} at ${doc.hospital}. ` +
            `You will receive a confirmation shortly.`
        );
      });

      card.appendChild(info);
      card.appendChild(btn);
      wrap.appendChild(card);
    });

    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Greet the patient once on load.
  addBubble(
    'bot',
    "Hello! \uD83D\uDC4B I'm here to help you find the right doctor. " +
      "Just tell me what's bothering you \u2014 like \"I have a fever\" or " +
      "\"my stomach hurts\" \u2014 and I'll ask a couple of simple questions " +
      "before suggesting which type of doctor you should see."
  );

  inputEl.focus();

  // Conversation history sent to the backend on every turn.
  // Assistant messages are stored as the raw JSON directives the API returned,
  // so the model has perfect recall of what it previously asked.
  /** @type {Array<{role:'user'|'assistant', content:string}>} */
  const history = [];

  // Once the model finalizes a specialty, the chat is over.
  let conversationDone = false;

  function setComposerEnabled(enabled) {
    inputEl.disabled = !enabled;
    sendBtn.disabled = !enabled;
    if (enabled) inputEl.focus();
  }

  // Submit handler: drive a single triage turn.
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (conversationDone) return;

    const text = inputEl.value.trim();
    if (!text) return;

    addBubble('user', text);
    history.push({ role: 'user', content: text });
    inputEl.value = '';
    setComposerEnabled(false);

    const typingEl = addBubble('bot', 'Thinking…', { typing: true });

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();

      typingEl.remove();

      if (!res.ok) {
        addBubble(
          'bot',
          data.error || 'Something went wrong. Please try again.'
        );
        setComposerEnabled(true);
        return;
      }

      // Track the assistant's raw directive so the model has full context next turn.
      if (data.assistantMessage) {
        history.push({ role: 'assistant', content: data.assistantMessage });
      }

      if (data.action === 'ask') {
        addBubble('bot', data.question);
        setComposerEnabled(true);
        return;
      }

      // action === 'finalize'
      addBubble('bot', data.message, { specialty: data.specialty });
      addDoctorList(data.specialty, data.doctors);
      conversationDone = true;
      inputEl.placeholder = 'Triage complete \u2014 reload the page to start a new chat.';
      setComposerEnabled(false);
    } catch (err) {
      typingEl.remove();
      addBubble(
        'bot',
        'Network error \u2014 please check your connection and try again.'
      );
      setComposerEnabled(true);
    }
  });
})();
