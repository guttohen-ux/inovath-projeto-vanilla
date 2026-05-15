document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'http://localhost:5000';

  const fullMapElement = document.getElementById('full-map');
  if (!fullMapElement) return;

  fetch(`${BASE_URL}/api/recycling/ecopontos`)
    .then(res => res.json())
    .then(data => {
      // Lista de ecopontos
      const list = document.getElementById('full-ecopontos-list');
      if (list) {
        list.innerHTML = data.map(ep => `
          <div class="ep-card">
            <i data-lucide="map-pin" class="ep-card-icon"></i>
            <div>
              <strong>${ep.name}</strong><br>
              <small style="color:#64748b">${ep.address}</small><br>
              <strong style="color:var(--primary); font-size:0.85rem">${ep.dist}</strong>
            </div>
          </div>
        `).join('');
        lucide.createIcons();
      }

      // Mapa interativo
      const map = L.map('full-map').setView([-3.08, -60.03], 12);
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
    .catch(err => console.error('Error fetching ecopontos:', err));
});
