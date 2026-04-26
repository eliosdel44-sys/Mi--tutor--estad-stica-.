// ── STATE ──
let conversationHistory = [];
let currentTopic = null;
let completedTopics = new Set();
let isWaiting = false;
const TOTAL_TOPICS = 20;

// ── TOPIC METADATA ──
const TOPIC_META = {
  variables:         { tag: 'Cap. 1 · Pág. 10',  title: 'Tipos de Variables y Datos',            sub: 'Cualitativa · Cuantitativa Discreta · Cuantitativa Continua' },
  poblacion_muestra: { tag: 'Cap. 1 · Pág. 5',   title: 'Población, Muestra y Términos Clave',   sub: 'Parámetro · Estadístico · Variable · Dato' },
  frecuencias:       { tag: 'Cap. 1 · Pág. 26',  title: 'Tablas de Frecuencia',                  sub: 'Frecuencia absoluta · relativa · acumulada' },
  muestreo:          { tag: 'Cap. 1 · Pág. 14',  title: 'Métodos de Muestreo',                   sub: 'Simple · Sistemático · Estratificado · Conglomerados' },
  media:             { tag: 'Cap. 2 · Pág. 100', title: 'Media Aritmética (x̄)',                  sub: 'Medidas de tendencia central' },
  mediana:           { tag: 'Cap. 2 · Pág. 101', title: 'Mediana',                               sub: 'Valor central de los datos ordenados' },
  moda:              { tag: 'Cap. 2 · Pág. 103', title: 'Moda',                                  sub: 'El valor que más se repite' },
  cuartiles:         { tag: 'Cap. 2 · Pág. 87',  title: 'Cuartiles, Percentiles y Cuantiles',    sub: 'Q1 · Q2 · Q3 · Deciles · Percentiles' },
  varianza:          { tag: 'Cap. 2 · Pág. 110', title: 'Varianza y Desviación Estándar',        sub: 'Medidas de dispersión · s² · s · Coef. de Variación' },
  boxplot:           { tag: 'Cap. 2 · Pág. 96',  title: 'Box Plot (Diagrama de Caja)',           sub: 'IQR · Valores atípicos · Bigotes' },
  sesgo:             { tag: 'Cap. 2 · Pág. 106', title: 'Sesgo y Forma de la Distribución',      sub: 'Asimetría positiva · negativa · simétrica' },
  graficos:          { tag: 'Cap. 2 · Pág. 68',  title: 'Gráficos Estadísticos',                sub: 'Histograma · Tallo y hoja · Barras · Series de tiempo' },
  prob_clasica:      { tag: 'Cap. 3 · Pág. 176', title: 'Probabilidad Clásica',                 sub: 'P(A) · Complemento · Unión · Intersección · Venn' },
  prob_condicional:  { tag: 'Cap. 3 · Pág. 181', title: 'Probabilidad Condicional e Independencia', sub: 'P(A|B) · Regla de Bayes · Tablas de contingencia' },
  binomial:          { tag: 'Cap. 4 · Pág. 253', title: 'Distribución Binomial',                sub: 'n ensayos · probabilidad p · éxito/fracaso' },
  poisson:           { tag: 'Cap. 4 · Pág. 266', title: 'Distribución de Poisson',              sub: 'Eventos raros en un intervalo de tiempo o espacio' },
  geometrica:        { tag: 'Cap. 4 · Pág. 259', title: 'Distribución Geométrica e Hipergeométrica', sub: 'Primer éxito · Muestreo sin reemplazo' },
  normal:            { tag: 'Cap. 6 · Pág. 366', title: 'Distribución Normal y Puntaje Z',      sub: 'Z = (x−μ)/σ · Tablas Z · Estandarización' },
  tcl:               { tag: 'Cap. 7 · Pág. 400', title: 'Teorema Central del Límite',           sub: 'Error estándar · Distribución muestral de x̄' },
  intervalos:        { tag: 'Cap. 8 · Pág. 445', title: 'Intervalos de Confianza',              sub: 'Z · t de Student · Proporción · Tamaño de muestra n' },
  hipotesis:         { tag: 'Cap. 9 · Pág. 506', title: 'Pruebas de Hipótesis (1 muestra)',     sub: 'H₀ · H₁ · valor-p · Errores Tipo I y II' },
  dos_muestras:      { tag: 'Cap. 10 · Pág. 568',title: 'Pruebas con Dos Muestras',             sub: 'Medias independientes · Pareadas · Proporciones' },
  chi2:              { tag: 'Cap. 11 · Pág. 623', title: 'Distribución Chi-Cuadrado (χ²)',      sub: 'Bondad de ajuste · Independencia · Homogeneidad' },
  regresion:         { tag: 'Cap. 12 · Pág. 680', title: 'Regresión Lineal Simple',             sub: 'ŷ = a + bx · Mínimos cuadrados · Predicción' },
  correlacion:       { tag: 'Cap. 12 · Pág. 680', title: 'Correlación (r y r²)',                sub: 'Coeficiente de Pearson · Coeficiente de determinación' },
  anova:             { tag: 'Cap. 13 · Pág. 744', title: 'ANOVA y Distribución F',              sub: 'Comparar 3+ grupos · F-ratio · One-Way ANOVA' },
};

// ── SYSTEM PROMPT ──
const SYSTEM_PROMPT = `Usted es el Tutor de Estadística del estudiante. Sus instrucciones son estrictas e inamovibles.

TRATO Y FORMALIDAD:
- Diríjase SIEMPRE al estudiante de "usted". NUNCA use "tú".
- Tono formal, respetuoso, cálido, al estilo profesional ecuatoriano.
- Nunca use términos informales ni palabras como "genial", "súper" o "lámpara".

ESTRUCTURA OBLIGATORIA POR TEMA:
1. TEORÍA (20%): Concepto muy intuitivo, máximo 4 líneas, con analogía del café o negocios.
2. EJERCICIO (80%): Datos concretos del libro Introductory Statistics (Illowsky & Dean, OpenStax), adaptados al contexto del estudiante.
3. GUÍA PASO A PASO: NO dé la respuesta completa. Pregunte solo el PRIMER paso. Espere respuesta. Luego guíe el siguiente.
4. CONEXIÓN INFERENCIAL: Al terminar algo descriptivo, muestre cómo ese resultado se usa en inferencia.
5. REFERENCIA: Mencione siempre capítulo y página exacta del libro.

CONTEXTO DEL ESTUDIANTE:
- Negocio: Master Barista Workshop (talleres de barismo en Ecuador)
- Carreras: Ingeniería de Alimentos + Administración
- Ejemplos relevantes: temperaturas de extracción, tiempos de preparación, calificaciones de clientes, ventas mensuales, gramajes de café.

METODOLOGÍA INTERACTIVA:
- Presente los datos del problema.
- Pregunte SOLO el primer paso.
- Si el estudiante se equivoca, dé una pista y vuelva a preguntar. No dé la respuesta directamente.
- Cuando termine, ofrezca la conexión inferencial y proponga otro ejercicio o el siguiente tema.
- Termine SIEMPRE con una pregunta directa al estudiante.

TEMAS QUE ENSEÑA (libro Introductory Statistics, OpenStax):
Cap.1: Variables, población/muestra, frecuencias, muestreo
Cap.2: Media, mediana, moda, cuartiles, percentiles, varianza, desv.estándar, box plot, sesgo, histogramas
Cap.3: Probabilidad clásica, condicional, Bayes, tablas de contingencia, árboles, Venn
Cap.4: Variables aleatorias discretas, valor esperado, Binomial, Poisson, Geométrica, Hipergeométrica
Cap.5: Variables continuas, Uniforme, Exponencial
Cap.6: Distribución Normal, puntaje Z, tablas Z
Cap.7: Teorema Central del Límite, error estándar
Cap.8: Intervalos de confianza (Z, t Student, proporción), tamaño de muestra
Cap.9: Pruebas de hipótesis una muestra (H0, H1, valor-p, errores Tipo I y II)
Cap.10: Pruebas con dos muestras (independientes, pareadas, proporciones)
Cap.11: Chi-cuadrado (bondad de ajuste, independencia, homogeneidad)
Cap.12: Regresión lineal (ŷ=a+bx), correlación r, r²
Cap.13: Distribución F, ANOVA de una vía, prueba de dos varianzas`;

// ── LOAD TOPIC ──
function loadTopic(topicKey) {
  currentTopic = topicKey;
  const meta = TOPIC_META[topicKey];
  if (!meta) return;

  document.getElementById('topicTag').textContent = '📖 ' + meta.tag;
  document.getElementById('topicTitle').textContent = meta.title;
  document.getElementById('topicSubtitle').textContent = meta.sub;

  document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.topic-btn').forEach(b => {
    if (b.getAttribute('onclick')?.includes(`'${topicKey}'`)) b.classList.add('active');
  });

  conversationHistory = [];
  document.getElementById('chatArea').innerHTML = '';
  document.getElementById('quickActions').style.display = 'flex';

  const initPrompt = `Comenzamos el tema: "${meta.title}" (${meta.tag}).
Por favor: (1) Explíqueme el concepto de forma muy intuitiva con una analogía de mi negocio de café Master Barista Workshop, en máximo 4 líneas. (2) Plantéeme inmediatamente un ejercicio práctico con datos concretos del libro, adaptado a mi contexto. (3) Pregúnteme SOLO cuál es el primer paso para resolverlo.`;

  askClaude(initPrompt, true);
}

// ── SEND MESSAGE ──
function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text || isWaiting) return;
  input.value = '';
  autoResize(input);
  addMessage('user', text);
  askClaude(text, false);
}

function sendQuick(text) {
  if (isWaiting) return;
  document.getElementById('userInput').value = text;
  sendMessage();
}

// ── CLAUDE API ──
async function askClaude(userText, isInit) {
  isWaiting = true;
  document.getElementById('sendBtn').disabled = true;
  conversationHistory.push({ role: 'user', content: userText });

  const typingId = showTyping();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: conversationHistory
      })
    });

    const data = await response.json();
    removeTyping(typingId);

    if (data.content && data.content[0]) {
      const reply = data.content.map(b => b.text || '').join('');
      conversationHistory.push({ role: 'assistant', content: reply });
      addMessage('tutor', reply);
      if (isInit) { completedTopics.add(currentTopic); updateProgress(); }
    } else {
      addMessage('tutor', 'Disculpe, hubo un inconveniente. Por favor intente nuevamente.');
    }
  } catch (err) {
    removeTyping(typingId);
    addMessage('tutor', 'Disculpe, se produjo un error de conexión. Verifique su internet e intente de nuevo.');
  }

  isWaiting = false;
  document.getElementById('sendBtn').disabled = false;
}

// ── UI HELPERS ──
function addMessage(role, text) {
  const chatArea = document.getElementById('chatArea');
  const msg = document.createElement('div');
  msg.className = `msg ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'tutor' ? '☕' : '👤';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = formatMessage(text);

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  chatArea.appendChild(msg);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(232,169,74,0.15);color:#e8a94a;padding:1px 6px;border-radius:4px;font-family:DM Mono,monospace;font-size:0.87em">$1</code>')
    .replace(/^### (.+)$/gm, '<strong style="color:#e8a94a;font-size:0.95rem;display:block;margin-top:10px">$1</strong>')
    .replace(/^## (.+)$/gm,  '<strong style="color:#e8a94a;font-size:1rem;display:block;margin-top:12px">$1</strong>')
    .replace(/^\d+\. (.+)$/gm, '<div style="display:flex;gap:8px;margin:4px 0"><span style="color:#c8702a;font-weight:700;min-width:16px">▸</span><span>$1</span></div>')
    .replace(/^[•\-] (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0"><span style="color:#c8702a">▸</span><span>$1</span></div>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function showTyping() {
  const chatArea = document.getElementById('chatArea');
  const wrap = document.createElement('div');
  wrap.className = 'msg tutor';
  const id = 'typing-' + Date.now();
  wrap.id = id;
  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '☕';
  const ind = document.createElement('div');
  ind.className = 'typing-indicator';
  ind.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  wrap.appendChild(avatar);
  wrap.appendChild(ind);
  chatArea.appendChild(wrap);
  chatArea.scrollTop = chatArea.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function updateProgress() {
  const pct = Math.round((completedTopics.size / TOTAL_TOPICS) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent = pct + '%';
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
