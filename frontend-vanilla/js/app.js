document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = mobileNav.style.display === 'flex';
      mobileNav.style.display = isVisible ? 'none' : 'flex';
      mobileNav.style.flexDirection = 'column';
    });
  }

  const BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 'http://localhost:5000';
  const userStr = localStorage.getItem('user');

  // ── Atualiza header conforme login ──
  function atualizarHeader() {
    const user = userStr ? JSON.parse(userStr) : null;
    const desktopActions = document.querySelector('.header-actions.desktop-nav');
    const mobileActions = document.querySelector('.mobile-nav-actions');

    const loginPagePath = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
    const profilePagePath = window.location.pathname.includes('/pages/') ? 'profile.html' : 'pages/profile.html';

    if (user && user.id) {
      const desktopHTML = `
        <a href="${profilePagePath}" class="btn-outline-white">
          <i data-lucide="user" width="14" height="14"></i> Perfil
        </a>
        <button class="btn-primary-green" id="btn-logout">Sair</button>
      `;
      const mobileHTML = `
        <a href="${profilePagePath}" class="btn-outline-white">
          <i data-lucide="user" width="14" height="14"></i> Perfil
        </a>
        <button class="btn-primary-green" id="btn-logout-mobile">Sair</button>
      `;
      if (desktopActions) desktopActions.innerHTML = desktopHTML;
      if (mobileActions) mobileActions.innerHTML = mobileHTML;

      document.getElementById('btn-logout')?.addEventListener('click', logout);
      document.getElementById('btn-logout-mobile')?.addEventListener('click', logout);
    } else {
      const desktopHTML = `
        <a href="${loginPagePath}" class="btn-outline-white">Entrar</a>
        <a href="${loginPagePath}?mode=register" class="btn-primary-green">Cadastrar</a>
      `;
      const mobileHTML = `
        <a href="${loginPagePath}" class="btn-outline-white">Entrar</a>
        <a href="${loginPagePath}?mode=register" class="btn-primary-green">Cadastrar</a>
      `;
      if (desktopActions) desktopActions.innerHTML = desktopHTML;
      if (mobileActions) mobileActions.innerHTML = mobileHTML;
    }
    lucide.createIcons();
  }

  function logout() {
    localStorage.removeItem('user');
    window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
  }

  atualizarHeader();

  // ── Carrega perfil do usuário logado ──
  function carregarPerfil(user) {
    const userNameEl = document.getElementById('user-name');
    const userBadgeEl = document.getElementById('user-badge');
    const userImpactEl = document.getElementById('user-impact');
    const userLevelEl = document.querySelector('.user-level span');
    const progressFill = document.querySelector('.progress-bar-fill');
    const progressHint = document.querySelector('.progress-hint');

    if (userNameEl) userNameEl.textContent = user.nome;
    if (userBadgeEl) userBadgeEl.textContent = user.nivel || 'Faça login';
    if (userImpactEl) userImpactEl.textContent = `${user.impacto_kg} kg desviados`;
    if (userLevelEl) userLevelEl.textContent = user.nivel;

    const impactValue = document.getElementById('impact-value');
    if (impactValue) impactValue.textContent = `${user.impacto_kg} kg`;

    const prox = user.proximo_nivel;
    if (prox && progressHint) {
      progressHint.textContent = `${user.impacto_kg} / ${user.proximo_nivel_kg} kg para ${prox}`;
    } else if (progressHint) {
      progressHint.textContent = `${user.impacto_kg} kg — nível máximo!`;
    }
    if (progressFill) progressFill.style.width = `${user.progresso_percent || 0}%`;

    // Histórico
    const recentActivityList = document.getElementById('recent-activity-list');
    if (recentActivityList && user.historico) {
      recentActivityList.innerHTML = user.historico.slice(0, 3).map(a => `
        <div class="activity-row">
          <i data-lucide="recycle" width="14" height="14"></i>
          <span>${a.material}</span>
          <span class="activity-time">${a.time}</span>
          <span class="activity-pts">${a.pts}</span>
        </div>
      `).join('');
      lucide.createIcons();
    }

    // Missões
    const missionsList = document.getElementById('missions-list');
    if (missionsList && user.missoes) {
      missionsList.innerHTML = user.missoes.map(m => `
        <div class="mission-row">
          <div class="mission-info">
            <p>${m.label}</p>
            <span class="mission-reward">${m.reward}</span>
          </div>
          <div class="mission-progress-wrap">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${(m.progress / m.total) * 100}%"></div>
            </div>
            <small>${m.progress}/${m.total}</small>
          </div>
        </div>
      `).join('');
    }
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.id) {
        fetch(`${BASE_URL}/api/users/${user.id}/profile`)
          .then(res => res.json())
          .then(data => {
            if (!data.erro) carregarPerfil(data);
          })
          .catch(console.error);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // ── Ranking e Stats ──
  fetch(`${BASE_URL}/api/dashboard`)
    .then(res => res.json())
    .then(data => {
      // Atualiza Ranking
      if (data.ranking && Array.isArray(data.ranking)) {
        const rankingTable = document.getElementById('ranking-table');
        if (rankingTable) {
          const currentUserName = userStr ? JSON.parse(userStr).nome : '';

          rankingTable.innerHTML = data.ranking.map((r, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
            const isUser = currentUserName === r.user;
            return `
              <div class="ranking-row ${isUser ? 'is-user' : ''}">
                <span class="rank-medal">${medal}</span>
                <span class="rank-name">${r.user}</span>
                <span class="rank-pts">${r.pontos.toLocaleString('pt-BR')} kg</span>
              </div>
            `;
          }).join('');
        }
      }

      // Atualiza Global Stats
      if (data.stats) {
        const gGuardioes = document.getElementById('global-guardioes');
        const gScans = document.getElementById('global-scans');
        const gResiduos = document.getElementById('global-residuos');

        if (gGuardioes) gGuardioes.textContent = data.stats.guardioes;
        if (gResiduos) gResiduos.textContent = `${data.stats.residuos_ton} ton`;
        if (gScans) gScans.textContent = data.stats.scans || gScans.textContent; // Usa o do backend ou mantém o atual se não vier
      }
    })
    .catch(console.error);

  // ── Ecopontos ──
  fetch(`${BASE_URL}/api/recycling/ecopontos`)
    .then(res => res.json())
    .then(data => {
      const ecopontosList = document.getElementById('ecopontos-list');
      if (ecopontosList) {
        ecopontosList.innerHTML = data.map(ep => `
          <div class="ecoponto-row">
            <i data-lucide="map-pin" class="ep-icon" width="14" height="14"></i>
            <div class="ep-info">
              <strong>${ep.name}</strong>
              <small>${ep.address}</small>
            </div>
            <span class="ep-dist">${ep.dist}</span>
          </div>
        `).join('');
        lucide.createIcons();
      }
    })
    .catch(console.error);

  // ── Mapa home ──
  const homeMapEl = document.getElementById('home-map');
  if (homeMapEl) {
    fetch(`${BASE_URL}/api/recycling/ecopontos`)
      .then(res => res.json())
      .then(data => {
        const map = L.map('home-map', { zoomControl: false, scrollWheelZoom: false }).setView([-3.08, -60.03], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        data.forEach(ep => {
          if (ep.lat && ep.lng) {
            L.marker([ep.lat, ep.lng])
              .addTo(map)
              .bindPopup(`<strong>${ep.name}</strong><br>${ep.address}<br><em>${ep.dist}</em>`);
          }
        });
      })
      .catch(console.error);
  }

  // ── Materiais ──
  fetch(`${BASE_URL}/api/recycling/materials`)
    .then(res => res.json())
    .then(data => {
      const materialsList = document.getElementById('materials-list');
      if (materialsList) {
        const iconMap = {
          plastico: 'package',
          metal: 'shield-check',
          papel: 'wind',
          vidro: 'droplets'
        };

        materialsList.innerHTML = data.map(m => {
          const iconName = iconMap[m.id] || 'recycle';
          return `
            <div class="material-tile" style="--mat-color: ${m.color};">
              <div class="material-icon-wrap" style="background: color-mix(in srgb, ${m.color} 12%, white); color: ${m.color};">
                <i data-lucide="${iconName}" width="32" height="32" stroke-width="1.5"></i>
              </div>
              <h3>${m.label}</h3>
              <p>${m.pts}</p>
            </div>
          `;
        }).join('');
        lucide.createIcons();
      }
    })
    .catch(console.error);

  // --- 1. CONFIGURAÇÃO DE TEMPO (COOLDOWN) ---
  const LIMITE_TEMPO = 30;

  // --- FUNÇÃO AUXILIAR: CONVERTE DATAURI EM BLOB PARA A IA ---
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  // --- 2. LÓGICA DO SCANNER COM IA ---
  window.iniciarScanner = () => {
    const agora = Date.now();
    const ultimoScan = localStorage.getItem('ultimo_scan');

    if (ultimoScan) {
      const tempoPassado = (agora - parseInt(ultimoScan)) / 1000;
      if (tempoPassado < LIMITE_TEMPO) {
        const faltam = Math.ceil(LIMITE_TEMPO - tempoPassado);
        alert(`⚠️ Calma lá, Guardião! Aguarde mais ${faltam}s para a próxima coleta.`);
        return; 
      }
    }

    const overlay = document.getElementById('scanner-overlay');
    if (overlay) overlay.style.display = 'flex';

    const html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: "environment" }, 
      config, 
      async (decodedText) => {
        // Captura o frame atual da câmera para a IA
        const canvas = document.querySelector('#reader canvas');
        const imagemBase64 = canvas.toDataURL("image/jpeg");
        const blobImagem = dataURItoBlob(imagemBase64);

        overlay.querySelector('h2').textContent = "🤖 IA Analisando...";

        try {
          const formData = new FormData();
          formData.append('image', blobImagem, 'scan.jpg');

          // Rota principal de IA no seu app.py
          const iaResponse = await fetch(`${BASE_URL}/api/scan`, {
            method: 'POST',
            body: formData
          });
          
          const iaData = await iaResponse.json();

          if (iaData.reciclavel) {
            await html5QrCode.stop();
            localStorage.setItem('ultimo_scan', Date.now());
            overlay.style.display = 'none';
            overlay.querySelector('h2').textContent = "Escanear QR Code"; 
            
            alert(`✅ IA Confirmou: ${iaData.material}\nPontos: ${iaData.pontos}\nDica: ${iaData.dica}`);
            
            if (typeof enviarDadosColeta === "function") {
              enviarDadosColeta(decodedText);
            }
          } else {
            alert(`❌ IA: ${iaData.dica || "Objeto não identificado."}`);
          }
        } catch (err) {
          console.error("Erro na análise da IA:", err);
          alert("Erro ao processar imagem pela IA. Verifique o servidor.");
        }
      }
    ).catch(err => {
      alert("Erro ao acessar a câmera.");
      if (overlay) overlay.style.display = 'none';
    });
  };

  // --- 3. FUNÇÃO DE LOGIN ---
  window.realizarLogin = async (event) => {
    event.preventDefault();

    const email = document.getElementById('email-input').value;
    const senha = document.getElementById('senha-input').value;

    try {
      const response = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(`Bem-vindo, ${data.user.nome}!`);
        window.location.href = '../index.html'; 
      } else {
        alert("❌ " + (data.erro || "Falha no login"));
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor Python.");
    }
  };

  // --- 4. VERIFICAÇÃO VISUAL DO BOTÃO ---
  setInterval(() => {
    const btn = document.getElementById('area-logada-scanner');
    const ultimoScan = localStorage.getItem('ultimo_scan');
    
    if (ultimoScan && btn) {
      const tempoPassado = (Date.now() - parseInt(ultimoScan)) / 1000;
      if (tempoPassado < LIMITE_TEMPO) {
        btn.style.opacity = "0.5";
        btn.style.filter = "grayscale(1)";
        btn.title = "Aguarde o tempo de recarga";
        return;
      }
    }
    if (btn) {
      btn.style.opacity = "1";
      btn.style.filter = "none";
    }
  }, 1000);
});