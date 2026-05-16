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

  // Máscara de Telefone (Brasil)
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
      if (v.length > 11) v = v.substring(0, 11);
      
      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      } else if (v.length > 0) {
        v = v.replace(/^(\d{0,2})/, '($1');
      }
      e.target.value = v;
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
              telefone: phoneInput.value.trim(),
              cidade: cityInput.value.trim()
            })
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem('user', JSON.stringify({ id: data.user.id, nome: data.user.nome, email: data.user.email }));
            showAlert('Conta criada com sucesso! Redirecionando...', 'success');
            setTimeout(() => window.location.href = '../index.html', 1000);
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
            setTimeout(() => window.location.href = '../index.html', 1000);
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
  const BASE_URL = 'http://localhost:5000';
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
