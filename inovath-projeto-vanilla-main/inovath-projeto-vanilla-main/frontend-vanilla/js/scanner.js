// Scanner Guardião - Registro Verde 🌿
// Implementação com ml5.js (MobileNet) e p5.js

let classifier;
let video;
let label = "Carregando modelo...";
let confidence = "";

// --- DICIONÁRIO DE RECICLAGEM ---
const materiaisVerdes = {
  "bottle": { label: "Plástico (Garrafa)", pts: 10 },
  "water bottle": { label: "Plástico (Garrafa)", pts: 10 },
  "wine bottle": { label: "Vidro (Garrafa)", pts: 20 },
  "can": { label: "Metal (Lata)", pts: 15 },
  "tin can": { label: "Metal (Lata)", pts: 15 },
  "soda can": { label: "Metal (Lata)", pts: 15 },
  "cup": { label: "Copo Descartável", pts: 5 },
  "paper": { label: "Papel/Papelão", pts: 5 },
  "packet": { label: "Papel/Embalagem", pts: 5 },
  "notebook": { label: "Papel", pts: 5 },
  "glass": { label: "Vidro", pts: 20 }
};

function setup() {
  // Cria o canvas dentro do container do vídeo
  const canvas = createCanvas(500, 400);
  canvas.parent('video-container');

  // Inicializa a captura de vídeo
  video = createCapture(VIDEO);
  video.size(500, 400);
  video.hide();

  // Inicializa o classificador de imagens (MobileNet)
  classifier = ml5.imageClassifier('MobileNet', video, modelReady);
}

function modelReady() {
  console.log('Modelo carregado!');
  label = "Modelo Pronto. Aponte para um objeto e clique em Analisar.";
  updateUI();
}

function draw() {
  // Espelha o vídeo para facilitar o uso como scanner
  image(video, 0, 0, width, height);
}

function analisar() {
  if (!classifier) return;
  label = "Analisando com IA...";
  updateUI();
  // Classifica o frame atual do vídeo
  classifier.classify(video, gotResult);
}

function gotResult(err, results) {
  if (err) {
    console.error(err);
    return;
  }

  if (results && results.length > 0) {
    const topResult = results[0].label.toLowerCase();
    const conf = results[0].confidence;
    let encontrado = false;

    // Filtro de Confiança: só valida se a IA tiver mais de 35% de certeza
    if (conf > 0.35) {
      for (let chave in materiaisVerdes) {
        if (topResult.includes(chave)) {
          label = `♻️ ${materiaisVerdes[chave].label}`;
          confidence = `Confiança: ${(conf * 100).toFixed(2)}% | +${materiaisVerdes[chave].pts} pts`;
          encontrado = true;
          break;
        }
      }
    }

    if (!encontrado) {
      // Limpa o nome do objeto (pega só a primeira palavra antes da vírgula)
      const objetoComum = results[0].label.split(',')[0];
      label = `Objeto: ${objetoComum}`;
      confidence = "Não identificado como reciclável padrão.";
    }

    updateUI();
  }
}

function updateUI() {
  const labelEl = document.getElementById('label');
  const confEl = document.getElementById('confidence');
  
  if (labelEl) {
    labelEl.textContent = label;
    // Estilo visual: Verde para sucesso, cinza para neutro
    labelEl.style.color = label.includes('♻️') ? '#22c55e' : '#64748b';
    labelEl.style.fontWeight = label.includes('♻️') ? 'bold' : 'normal';
  }
  
  if (confEl) {
    confEl.textContent = confidence;
  }
}