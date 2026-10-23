/* Standalone design survey with one preview link for all eight themes. */
(() => {
  'use strict';
  const form = document.querySelector('#theme-feedback');
  const status = document.querySelector('#form-status');
  const submit = document.querySelector('#submit-feedback');
  const favourite = () => form.elements.favourite.value;
  const local = form.dataset.submissionMode !== 'netlify';
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  form.elements['response-id'].value = id;
  if (local) document.querySelector('#save-note').textContent = 'Local preview: responses are saved to this preview server, not sent to Netlify.';

  for (const group of ['reasons', 'feelings']) {
    const inputs = [...form.querySelectorAll(`input[name="${group}"]`)];
    const counter = document.querySelector(group === 'reasons' ? '#reason-count' : '#feeling-count');
    const update = () => {
      const count = inputs.filter(input => input.checked).length;
      inputs.forEach(input => { input.disabled = count >= 3 && !input.checked; });
      counter.textContent = count ? `${count} of 3 selected` : '';
    };
    inputs.forEach(input => input.addEventListener('change', update));
    update();
  }
  function updateChoices() {
    const selected = favourite();
    const runner = form.elements['runner-up'];
    const least = form.elements.least;
    for (const field of [runner, least]) {
      for (const option of field.options) option.disabled = option.value === selected;
      if (field.value === selected && selected) field.value = '';
    }
    // A runner-up cannot also be the least suitable theme.
    for (const option of least.options) {
      if (option.value && option.value !== 'none' && option.value === runner.value) option.disabled = true;
    }
    if (least.value && least.value !== 'none' && least.value === runner.value) least.value = '';
  }
  form.addEventListener('change', updateChoices);
  document.querySelector('#website-preview').addEventListener('click', () => {
    document.querySelector('#preview-note').textContent = 'Preview opens in one tab. Use its A–H tabs, then come back here to share your thoughts.';
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('bot-field')) return;
    if (!String(data.get('reviewer-name') || '').trim()) {
      status.textContent = 'Please enter your name.';
      status.classList.add('error');
      form.elements['reviewer-name'].focus();
      return;
    }
    if (String(data.get('why')).trim().length < 5) {
      status.textContent = 'Please add a few words about why you chose this theme.';
      status.classList.add('error');
      form.elements.why.focus();
      return;
    }
    submit.disabled = true;
    status.classList.remove('error');
    status.textContent = 'Saving your feedback…';
    try {
      if (local) {
        const sessionResponse = await fetch('/api/session');
        if (!sessionResponse.ok || !sessionResponse.headers.get('content-type')?.includes('application/json')) throw new Error('The local feedback server is unavailable. Your answers are still here; please try again.');
        const session = await sessionResponse.json();
        const payload = Object.fromEntries(data);
        payload.reasons = data.getAll('reasons');
        payload.feelings = data.getAll('feelings');
        const response = await fetch('/api/theme-feedback', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-CSRF-Token': session.csrf}, body: JSON.stringify(payload)});
        const saved = await response.json();
        if (!response.ok || !saved.ok) throw new Error(saved.error || 'Your feedback could not be saved. Please try again.');
      } else {
        // Netlify strips data-netlify when form detection has processed this HTML.
        if (form.hasAttribute('data-netlify')) throw new Error('Feedback collection is not active on this preview yet. Your answers are still here.');
        const response = await fetch('/feedback/', {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: new URLSearchParams(data).toString()});
        if (!response.ok) throw new Error('Your feedback could not be sent. Your answers are still here; please try again.');
      }
      form.hidden = true;
      const success = document.querySelector('#success');
      success.hidden = false;
      if (local) document.querySelector('#success-note').textContent = 'Your feedback is saved to the local preview server. Thank you for helping us find our look.';
      success.focus();
      success.scrollIntoView({block: 'center'});
    } catch (error) {
      status.textContent = error.message || 'Something went wrong. Your answers are still here; please try again.';
      status.classList.add('error');
    } finally {
      submit.disabled = false;
    }
  });
  updateChoices();
})();
