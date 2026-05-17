document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const BASE_URL = 'http://localhost:5000';
  const userStr = localStorage.getItem('user');
  const alertEl = document.getElementById('profile-alert');

  function showAlert(msg, type = 'error') {
    if (!alertEl) return;
    alertEl.textContent = msg;
    alertEl.className = `auth-alert ${type} show`;
  }
  function hideAlert() {
    if (!alertEl) return;
    alertEl.className = 'auth-alert';
  }

  if (!userStr) {
    showAlert('Você precisa estar logado para acessar esta página.', 'error');
    const profileName = document.getElementById('profile-name');
    if (profileName) profileName.textContent = 'Não logado';
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) saveBtn.disabled = true;
    return;
  }

  const userData = JSON.parse(userStr);

  // Carrega dados do perfil
  fetch(`${BASE_URL}/api/users/${userData.id}/profile`)
    .then(res => res.json())
    .then(data => {
      if (data.erro) {
        showAlert(data.erro, 'error');
        return;
      }

      const profileName = document.getElementById('profile-name');
      const profileEmail = document.getElementById('profile-email');
      const profileLevel = document.getElementById('profile-level');
      const profileImpact = document.getElementById('profile-impact');
      const profileInitials = document.getElementById('profile-initials');
      const editName = document.getElementById('edit-name');
      const editEmail = document.getElementById('edit-email');
      const editPhone = document.getElementById('edit-phone');
      const editCity = document.getElementById('edit-city');

      if (profileName) profileName.textContent = data.nome;
      if (profileEmail) profileEmail.textContent = data.email;
      if (profileLevel) profileLevel.textContent = data.nivel;
      if (profileImpact) profileImpact.textContent = data.impacto_kg;
      if (profileInitials) profileInitials.textContent = data.nome.charAt(0).toUpperCase();
      if (editName) editName.value = data.nome;
      if (editEmail) editEmail.value = data.email;
      if (editPhone) editPhone.value = data.telefone || '';
      if (editCity) editCity.value = data.cidade || '';

      // Missões concluídas
      const concluidas = (data.missoes || []).filter(m => m.progress >= m.total).length;
      const profileMissoes = document.getElementById('profile-missoes');
      if (profileMissoes) profileMissoes.textContent = concluidas;

      // Ranking
      fetch(`${BASE_URL}/`)
        .then(r => r.json())
        .then(d => {
          const ranking = d.ranking || [];
          const pos = ranking.findIndex(r => r.user === data.nome);
          const rankPos = document.getElementById('profile-rank-pos');
          if (rankPos) rankPos.textContent = pos >= 0 ? `${pos + 1}${'\u00ba'}` : '-';
        })
        .catch(() => { });

      // Histórico
      const historicoEl = document.getElementById('profile-historico');
      if (historicoEl && data.historico && data.historico.length > 0) {
        historicoEl.innerHTML = data.historico.map(a => `
          <div class="profile-historico-row">
            <i data-lucide="recycle" width="16" height="16" color="#4ade80"></i>
            <span>${a.material}</span>
            <span class="profile-historico-time">${a.time}</span>
            <span class="profile-historico-pts">${a.pts}</span>
          </div>
        `).join('');
        lucide.createIcons();
      }
    })
    .catch(() => showAlert('Erro ao carregar perfil.', 'error'));

  // Máscara de Telefone (Brasil)
  const editPhone = document.getElementById('edit-phone');
  if (editPhone) {
    editPhone.addEventListener('input', (e) => {
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

  // Salvar alterações
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const nomeEl = document.getElementById('edit-name');
      const telefoneEl = document.getElementById('edit-phone');
      const cidadeEl = document.getElementById('edit-city');

      const nome = nomeEl ? nomeEl.value.trim() : '';
      const telefone = telefoneEl ? telefoneEl.value.trim() : '';
      const cidade = cidadeEl ? cidadeEl.value.trim() : '';

      if (!nome) {
        showAlert('O nome não pode ficar vazio.');
        return;
      }

      const btn = document.getElementById('save-btn');
      if (!btn) return;

      btn.disabled = true;
      const btnSpan = btn.querySelector('span');
      if (btnSpan) btnSpan.textContent = 'Salvando...';

      try {
        const res = await fetch(`${BASE_URL}/api/users/${userData.id}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, telefone, cidade })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('user', JSON.stringify({ id: data.user.id, nome: data.user.nome, email: data.user.email }));
          const profileName = document.getElementById('profile-name');
          const profileInitials = document.getElementById('profile-initials');
          if (profileName) profileName.textContent = data.user.nome;
          if (profileInitials) profileInitials.textContent = data.user.nome.charAt(0).toUpperCase();
          showAlert('Perfil atualizado com sucesso!', 'success');
        } else {
          showAlert(data.erro || 'Erro ao salvar.');
        }
      } catch (err) {
        showAlert('Erro ao conectar ao servidor.');
      } finally {
        btn.disabled = false;
        if (btnSpan) btnSpan.textContent = 'Salvar alterações';
      }
    });
  }
});
