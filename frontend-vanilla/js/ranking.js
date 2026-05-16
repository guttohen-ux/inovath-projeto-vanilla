document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:5000/')
    .then(res => res.json())
    .then(data => {
      if (data.ranking && Array.isArray(data.ranking)) {
        const rankingTable = document.getElementById('full-ranking-table');
        if (!rankingTable) return;

        const userObjStr = localStorage.getItem('user');
        const currentUserName = userObjStr ? JSON.parse(userObjStr).nome : '';

        rankingTable.innerHTML = data.ranking.map((r, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
          const isUser = currentUserName === r.user;
          return `
            <div class="ranking-row ${isUser ? 'is-user' : ''}">
              <div class="rank-info">
                <span class="rank-medal">${medal}</span>
                <span class="rank-name">${r.user}</span>
              </div>
              <span class="rank-pts">${r.pontos.toLocaleString('pt-BR')} kg</span>
            </div>
          `;
        }).join('');
      }
    });
});
