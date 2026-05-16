document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  const codigo = urlParams.get('codigo');
  const alertEl = document.getElementById('auth-alert');
  const resetForm = document.getElementById('reset-form');

  if (!email || !codigo) {
    if (alertEl) {
      alertEl.textContent = 'Link inválido. Solicite um novo código.';
      alertEl.className = 'auth-alert error show';
    }
    if (resetForm) {
      const btn = resetForm.querySelector('button');
      if (btn) btn.disabled = true;
    }
    return;
  }

  const passwordInput = document.getElementById('password-input');
  const confirmInput = document.getElementById('confirm-input');
  const resetBtn = document.getElementById('reset-btn');
  const passwordToggle = document.getElementById('password-toggle');

  function showAlert(msg, type = 'error') {
    if (!alertEl) return;
    alertEl.textContent = msg;
    alertEl.className = `auth-alert ${type} show`;
  }

  function hideAlert() {
    if (!alertEl) return;
    alertEl.className = 'auth-alert';
  }

  if (passwordToggle) {
    passwordToggle.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      passwordToggle.innerHTML = type === 'password'
        ? '<i data-lucide="eye" width="18" height="18"></i>'
        : '<i data-lucide="eye-off" width="18" height="18"></i>';
      lucide.createIcons();
    });
  }

  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const novaSenha = passwordInput ? passwordInput.value : '';
      const confirm = confirmInput ? confirmInput.value : '';

      if (!novaSenha || novaSenha.length < 4) {
        showAlert('A senha deve ter pelo menos 4 caracteres.');
        return;
      }

      if (novaSenha !== confirm) {
        showAlert('As senhas não conferem.');
        return;
      }

      if (resetBtn) {
        resetBtn.disabled = true;
        const btnSpan = resetBtn.querySelector('span');
        if (btnSpan) btnSpan.textContent = 'Redefinindo...';
      }

      try {
        const BASE_URL = `http://${window.location.hostname}:5000`;
        const res = await fetch(`${BASE_URL}/api/users/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, codigo, nova_senha: novaSenha })
        });
        const data = await res.json();
        if (res.ok) {
          showAlert('Senha redefinida com sucesso! Redirecionando...', 'success');
          setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
          showAlert(data.erro || 'Erro ao redefinir senha.');
        }
      } catch (err) {
        showAlert('Erro ao conectar ao servidor.');
      } finally {
        if (resetBtn) {
          resetBtn.disabled = false;
          const btnSpan = resetBtn.querySelector('span');
          if (btnSpan) btnSpan.textContent = 'Redefinir senha';
        }
      }
    });
  }
});
