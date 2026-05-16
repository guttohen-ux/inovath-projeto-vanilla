const BASE_URL = 'http://localhost:5000';

function redirectAfterAuth(user) {
  const firstName = (user.nome || 'Guardião').trim().split(/\s+/)[0];
  sessionStorage.setItem('rv_show_welcome', firstName);
  window.location.href = '../index.html';
}

function getPhoneDigits(value) {
  return (value || '').replace(/\D/g, '');
}

function formatPhoneBR(value) {
  const digits = getPhoneDigits(value).slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidPhoneBR(value) {
  const digits = getPhoneDigits(value);
  if (!digits) return true;
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = parseInt(digits.slice(0, 2), 10);
  return ddd >= 11 && ddd <= 99;
}

function showGoogleAlert(msg, type = 'error') {
  const alertEl = document.getElementById('auth-alert');
  if (!alertEl) return;
  alertEl.textContent = msg;
  alertEl.className = `auth-alert ${type} show`;
}

window.handleCredentialResponse = async function (response) {
  if (!response?.credential) {
    showGoogleAlert('Não foi possível obter as credenciais do Google.');
    return;
  }

  showGoogleAlert('Entrando com Google...', 'success');

  try {
    const res = await fetch(`${BASE_URL}/api/users/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        nome: data.user.nome,
        email: data.user.email
      }));
      showGoogleAlert('Login realizado! Redirecionando...', 'success');
      setTimeout(() => redirectAfterAuth(data.user), 1000);
    } else {
      showGoogleAlert(data.erro || 'Erro ao entrar com Google.');
    }
  } catch {
    showGoogleAlert('Erro ao conectar ao servidor. Verifique se o backend está rodando.');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const urlParams = new URLSearchParams(window.location.search);
  let isRegister = urlParams.get('mode') === 'register';

  const tabs = document.querySelectorAll('.auth-tab');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnIcon = document.getElementById('btn-icon');
  const toggleText = document.getElementById('toggle-text');
  const authForm = document.getElementById('auth-form');
  const alertEl = document.getElementById('auth-alert');
  const nameInput = document.getElementById('name-input');
  const phoneInput = document.getElementById('phone-input');
  const cityInput = document.getElementById('city-input');
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const confirmInput = document.getElementById('confirm-password-input');
  const registerFields = document.getElementById('register-fields');
  const confirmGroup = document.getElementById('confirm-password-group');
  const forgotLink = document.getElementById('forgot-link');
  const toggleModeBtn = document.getElementById('toggle-mode-btn');
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

  function updateUI() {
    hideAlert();
    if (isRegister) {
      if (tabs[0]) tabs[0].classList.remove('active');
      if (tabs[1]) tabs[1].classList.add('active');
      if (title) title.textContent = 'Criar sua conta';
      if (subtitle) subtitle.textContent = 'Junte-se aos guardiões da Amazônia';
      if (registerFields) registerFields.style.display = 'block';
      if (confirmGroup) confirmGroup.style.display = 'block';
      if (forgotLink) forgotLink.style.display = 'none';
      if (btnText) btnText.textContent = 'Cadastrar';
      if (btnIcon) btnIcon.setAttribute('data-lucide', 'user-plus');
      if (toggleText) toggleText.textContent = 'Já tenho uma conta';
      if (nameInput) nameInput.required = true;
      if (confirmInput) confirmInput.required = true;
    } else {
      if (tabs[0]) tabs[0].classList.add('active');
      if (tabs[1]) tabs[1].classList.remove('active');
      if (title) title.textContent = 'Bem-vindo de volta';
      if (subtitle) subtitle.textContent = 'Entre na sua conta para continuar';
      if (registerFields) registerFields.style.display = 'none';
      if (confirmGroup) confirmGroup.style.display = 'none';
      if (forgotLink) forgotLink.style.display = 'block';
      if (btnText) btnText.textContent = 'Entrar';
      if (btnIcon) btnIcon.setAttribute('data-lucide', 'log-in');
      if (toggleText) toggleText.textContent = 'Criar uma conta';
      if (nameInput) nameInput.required = false;
      if (confirmInput) confirmInput.required = false;
    }
    lucide.createIcons();
  }

  function switchMode(mode) {
    isRegister = mode === 'register';
    window.history.pushState({}, '', isRegister ? '?mode=register' : window.location.pathname);
    updateUI();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchMode(tab.dataset.tab);
    });
  });

  if (toggleModeBtn) {
    toggleModeBtn.addEventListener('click', () => {
      switchMode(isRegister ? 'login' : 'register');
    });
  }

  // Password toggle
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

  // Telefone: apenas DDD + número (10 ou 11 dígitos)
  if (phoneInput) {
    phoneInput.addEventListener('keydown', (e) => {
      const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
      if (!/^\d$/.test(e.key)) e.preventDefault();
    });

    phoneInput.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      phoneInput.value = formatPhoneBR(text);
    });

    phoneInput.addEventListener('input', (e) => {
      e.target.value = formatPhoneBR(e.target.value);
    });
  }

  updateUI();

  // Submit
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showAlert('Preencha todos os campos obrigatórios.');
        return;
      }

      if (isRegister) {
        const name = nameInput.value.trim();
        const confirm = confirmInput.value;

        if (!name) {
          showAlert('Informe seu nome.');
          nameInput.focus();
          return;
        }
        if (password !== confirm) {
          showAlert('As senhas não conferem.');
          confirmInput.focus();
          return;
        }
        if (password.length < 4) {
          showAlert('A senha deve ter pelo menos 4 caracteres.');
          return;
        }

        const phoneDigits = getPhoneDigits(phoneInput?.value);
        if (phoneDigits && !isValidPhoneBR(phoneInput.value)) {
          showAlert('Telefone inválido. Use DDD + número: (92) 99999-9999');
          phoneInput.focus();
          return;
        }

        submitBtn.disabled = true;
        btnText.textContent = 'Cadastrando...';

        try {
          const res = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: name,
              email,
              senha: password,
              telefone: formatPhoneBR(phoneInput.value),
              cidade: cityInput.value.trim()
            })
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem('user', JSON.stringify({ id: data.user.id, nome: data.user.nome, email: data.user.email }));
            showAlert('Conta criada com sucesso! Redirecionando...', 'success');
            setTimeout(() => redirectAfterAuth(data.user), 1000);
          } else {
            showAlert(data.erro || 'Erro ao cadastrar.');
          }
        } catch (err) {
          showAlert('Erro ao conectar ao servidor.');
        } finally {
          submitBtn.disabled = false;
          btnText.textContent = 'Cadastrar';
        }
      } else {
        submitBtn.disabled = true;
        btnText.textContent = 'Entrando...';

        try {
          const res = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha: password })
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem('user', JSON.stringify({ id: data.user.id, nome: data.user.nome, email: data.user.email }));
            showAlert('Login realizado! Redirecionando...', 'success');
            setTimeout(() => redirectAfterAuth(data.user), 1000);
          } else {
            showAlert(data.erro || 'Credenciais inválidas.');
          }
        } catch (err) {
          showAlert('Erro ao conectar ao servidor.');
        } finally {
          submitBtn.disabled = false;
          btnText.textContent = 'Entrar';
        }
      }
    });
  }

  // ── Global Stats para o Banner ──
  fetch(`${BASE_URL}/`)
    .then(res => res.json())
    .then(data => {
      if (data.stats) {
        const authGuardioes = document.getElementById('auth-guardioes');
        const authScans = document.getElementById('auth-scans');
        const authResiduos = document.getElementById('auth-residuos');

        if (authGuardioes) authGuardioes.textContent = data.stats.guardioes;
        if (authResiduos) authResiduos.textContent = `${data.stats.residuos_ton}t`;
        if (authScans) authScans.textContent = data.stats.scans || authScans.textContent;
      }
    })
    .catch(console.error);
});
