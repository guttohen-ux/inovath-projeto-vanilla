document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const alertEl = document.getElementById('auth-alert');
  const stepRequest = document.getElementById('step-request');
  const stepSent = document.getElementById('step-sent');
  const forgotForm = document.getElementById('forgot-form');
  const codeForm = document.getElementById('code-form');
  const emailInput = document.getElementById('email-input');
  const sentEmailDisplay = document.getElementById('sent-email-display');
  const codeInput = document.getElementById('code-input');
  const sendBtn = document.getElementById('send-btn');
  const verifyBtn = document.getElementById('verify-btn');
  const resendLink = document.getElementById('resend-link');

  let currentEmail = '';
  let currentCode = '';

  function showAlert(msg, type = 'error') {
    if (!alertEl) return;
    alertEl.textContent = msg;
    alertEl.className = `auth-alert ${type} show`;
  }

  function hideAlert() {
    if (!alertEl) return;
    alertEl.className = 'auth-alert';
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();
      currentEmail = emailInput.value.trim();
      if (!currentEmail) {
        showAlert('Informe seu e-mail.');
        return;
      }
      sendBtn.disabled = true;
      const btnSpan = sendBtn.querySelector('span');
      if (btnSpan) btnSpan.textContent = 'Enviando...';
      try {
        const BASE_URL = `http://${window.location.hostname}:5000`;
        const res = await fetch(`${BASE_URL}/api/users/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentEmail })
        });
        const data = await res.json();
        if (res.ok) {
          currentCode = data.dev_codigo || '';
          if (sentEmailDisplay) sentEmailDisplay.textContent = currentEmail;
          if (stepRequest) stepRequest.style.display = 'none';
          if (stepSent) stepSent.style.display = 'block';
          showAlert('Código enviado! Verifique seu e-mail' + (currentCode ? ` (dev: ${currentCode})` : ''), 'success');
          if (codeInput) codeInput.focus();
        } else {
          showAlert(data.erro || 'Erro ao enviar código.');
        }
      } catch (err) {
        showAlert('Erro ao conectar ao servidor.');
      } finally {
        sendBtn.disabled = false;
        if (btnSpan) btnSpan.textContent = 'Enviar código';
      }
    });
  }

  if (codeForm) {
    codeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideAlert();
      const codigo = codeInput.value.trim();
      if (!codigo || codigo.length < 6) {
        showAlert('Informe o código de 6 dígitos.');
        return;
      }
      window.location.href = `reset-password.html?email=${encodeURIComponent(currentEmail)}&codigo=${encodeURIComponent(codigo)}`;
    });
  }

  if (resendLink) {
    resendLink.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!currentEmail) return;
      try {
        const BASE_URL = `http://${window.location.hostname}:5000`;
        const res = await fetch(`${BASE_URL}/api/users/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentEmail })
        });
        const data = await res.json();
        if (res.ok) {
          currentCode = data.dev_codigo || '';
          showAlert('Código reenviado!' + (currentCode ? ` (dev: ${currentCode})` : ''), 'success');
        } else {
          showAlert('Erro ao reenviar código.');
        }
      } catch (err) {
        showAlert('Erro ao conectar ao servidor.');
      }
    });
  }
});
