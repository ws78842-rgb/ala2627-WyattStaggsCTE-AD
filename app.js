const batters = [
  ['Julio Rodriguez', '44', 'CF', '.312'], ['Mookie Betts', '50', '2B', '.298'],
  ['Aaron Judge', '99', 'RF', '.327'], ['Shohei Ohtani', '17', 'DH', '.304'],
  ['Juan Soto', '22', 'RF', '.311'], ['Ronald Acuna Jr.', '13', 'LF', '.289'],
  ['Bobby Witt Jr.', '7', 'SS', '.301'], ['Freddie Freeman', '5', '1B', '.315'],
  ['Yordan Alvarez', '44', 'DH', '.286']
];
const pitchTypes = [['FASTBALL', '96 MPH'], ['SLIDER', '88 MPH'], ['CHANGEUP', '84 MPH'], ['CURVE', '79 MPH']];
const battingStats = [
  { atBats: 548, hits: 171, homeRuns: 24, rbi: 86 }, { atBats: 572, hits: 170, homeRuns: 26, rbi: 91 },
  { atBats: 511, hits: 167, homeRuns: 48, rbi: 118 }, { atBats: 537, hits: 163, homeRuns: 38, rbi: 102 },
  { atBats: 556, hits: 173, homeRuns: 35, rbi: 97 }, { atBats: 534, hits: 154, homeRuns: 41, rbi: 101 },
  { atBats: 569, hits: 171, homeRuns: 32, rbi: 89 }, { atBats: 563, hits: 177, homeRuns: 25, rbi: 93 },
  { atBats: 521, hits: 149, homeRuns: 31, rbi: 88 }
];
const state = { batter: 0, inning: 1, outs: 0, strikes: 0, balls: 0, away: 0, home: 0, bases: [false, false, false], pitchReady: false, pitchStartedAt: 0, pitchTimer: null, plays: 1 };
const tableState = { sort: 'average', direction: 'desc' };
const $ = (selector) => document.querySelector(selector);

function initials(name) { return name.split(' ').map((part) => part[0]).join('').slice(0, 2); }
function setText(selector, value) { $(selector).textContent = value; }

function renderRoster() {
  $('#rosterList').innerHTML = batters.map((batter, index) => `<button class="roster-player ${index === state.batter ? 'selected' : ''}" type="button" data-batter="${index}"><span>${String(index + 1).padStart(2, '0')}</span><b>${batter[0]}</b><small>${batter[2]}</small></button>`).join('');
  document.querySelectorAll('[data-batter]').forEach((button) => button.addEventListener('click', () => { state.batter = Number(button.dataset.batter); renderBatter(); }));
}

function renderBatter() {
  const batter = batters[state.batter];
  setText('#batterName', batter[0]); setText('#batterNumber', batter[1]); setText('#playerAvatar', initials(batter[0]));
  setText('#batterOrder', String(state.batter + 1).padStart(2, '0')); setText('#batterMeta', `${batter[2]}  •  R/R  •  AVG ${batter[3]}`); renderRoster();
}

function renderStats() {
  const rows = batters.map((batter, index) => ({ name: batter[0], position: batter[2], average: Number(batter[3]), ...battingStats[index] }));
  rows.sort((first, second) => {
    const firstValue = first[tableState.sort]; const secondValue = second[tableState.sort];
    const comparison = typeof firstValue === 'string' ? firstValue.localeCompare(secondValue) : firstValue - secondValue;
    return tableState.direction === 'asc' ? comparison : -comparison;
  });
  $('#statsBody').innerHTML = rows.map((row, index) => `<tr><td><span class="table-rank">${String(index + 1).padStart(2, '0')}</span><strong>${row.name}</strong></td><td>${row.position}</td><td class="highlight">${row.average.toFixed(3).replace('0.', '.')}</td><td>${row.atBats}</td><td>${row.hits}</td><td>${row.homeRuns}</td><td>${row.rbi}</td></tr>`).join('');
}

function addPlay(message, active = true) {
  const log = $('#playLog'); const item = document.createElement('li'); item.textContent = message;
  if (active) { log.querySelector('.active')?.classList.remove('active'); item.classList.add('active'); }
  log.prepend(item); state.plays += 1; setText('#playCount', `${String(Math.min(state.plays, 9)).padStart(2, '0')} / 09`);
}

function updateScoreboard() {
  setText('#awayScore', state.away); setText('#homeScore', state.home); setText('#inningNumber', state.inning); setText('#countLabel', `${state.balls} - ${state.strikes}`);
  document.querySelectorAll('.outs i').forEach((light, index) => light.classList.toggle('lit', index < state.outs));
  ['first', 'second', 'third'].forEach((base, index) => $(`.${base}`).classList.toggle('occupied', state.bases[index]));
}

function animateBatter(animation) {
  const batter = $('.batter');
  batter.classList.remove('swing-contact', 'swing-power', 'swing-miss');
  void batter.offsetWidth;
  batter.classList.add(animation);
  setTimeout(() => batter.classList.remove(animation), 700);
}

function animateRunner(outcome) {
  const runner = document.createElement('span');
  runner.className = `runner runner-${outcome.toLowerCase().replace(' ', '-')}`;
  $('#runnerLayer').appendChild(runner);
  runner.addEventListener('animationend', () => runner.remove(), { once: true });
}

function finishPitch() {
  if (!state.pitchReady) return;
  state.pitchReady = false;
  state.pitchTimer = null;
  $('#pitchMarker').classList.remove('active');
  document.querySelectorAll('[data-swing]').forEach((button) => { button.disabled = true; });
  $('#pitchButton').disabled = false;
  state.strikes += 1;
  setText('#fieldCallout', state.strikes >= 3 ? 'STRIKE 3' : 'CALLED STRIKE');
  setText('#pitchHint', 'Too late. Time the next pitch at the plate.');
  addPlay(state.strikes >= 3 ? `${batters[state.batter][0]} watches strike three.` : `${batters[state.batter][0]} watches the pitch cross the plate.`);
  if (state.strikes >= 3) nextBatter(true);
  state.balls = 0;
  state.strikes = state.strikes >= 3 ? 0 : state.strikes;
  updateScoreboard();
}

function throwPitch() {
  if (state.pitchReady) return;
  const pitch = pitchTypes[Math.floor(Math.random() * pitchTypes.length)]; state.pitchReady = true; state.pitchStartedAt = performance.now();
  const pitcher = $('.pitcher');
  pitcher.classList.remove('throwing');
  void pitcher.offsetWidth;
  pitcher.classList.add('throwing');
  setText('#pitchRead', `${pitch[0]}  /  ${pitch[1]}`); setText('#pitchHint', '5.0 SEC FLIGHT // Swing as it reaches the plate.'); setText('#fieldCallout', pitch[0]);
  $('#pitchMarker').classList.remove('hit'); $('#pitchMarker').classList.add('active'); $('#pitchButton').disabled = true;
  document.querySelectorAll('[data-swing]').forEach((button) => { button.disabled = false; });
  state.pitchTimer = setTimeout(finishPitch, 5000);
}

function swing(type) {
  if (!state.pitchReady) return;
  const elapsed = performance.now() - state.pitchStartedAt; const timingError = Math.abs(5000 - elapsed); const hitChance = type === 'power' ? 0.52 : 0.73; const wellTimed = timingError <= 650; const roll = Math.random(); const hit = wellTimed && roll <= hitChance; const marker = $('#pitchMarker');
  clearTimeout(state.pitchTimer); state.pitchTimer = null;
  animateBatter(hit ? `swing-${type}` : 'swing-miss');
  marker.classList.remove('active'); marker.classList.add('hit'); setTimeout(() => marker.classList.remove('hit'), 420);
  state.pitchReady = false; document.querySelectorAll('[data-swing]').forEach((button) => { button.disabled = true; }); $('#pitchButton').disabled = false;
  if (!hit) { state.strikes += 1; setText('#fieldCallout', wellTimed ? (state.strikes >= 3 ? 'STRIKE 3' : 'SWING & MISS') : 'BAD TIMING'); addPlay(wellTimed && state.strikes >= 3 ? `${batters[state.batter][0]} strikes out swinging.` : wellTimed ? `${batters[state.batter][0]} swings through the ${type} pitch.` : `${batters[state.batter][0]} swings too early or too late.`); if (state.strikes >= 3) nextBatter(true); }
  else { const outcomeRoll = Math.random(); const outcome = type === 'power' && outcomeRoll < .32 ? 'HOME RUN' : outcomeRoll < .2 ? 'DOUBLE' : 'SINGLE'; const runs = outcome === 'HOME RUN' ? 1 + state.bases.filter(Boolean).length : (state.bases[2] ? 1 : 0); state.home += runs; animateRunner(outcome); state.bases = outcome === 'HOME RUN' ? [false, false, false] : outcome === 'DOUBLE' ? [false, true, false] : [true, false, false]; setText('#fieldCallout', outcome); addPlay(`${batters[state.batter][0]} ${outcome.toLowerCase()}${runs ? `, ${runs} run${runs > 1 ? 's' : ''} scored` : ''}.`); nextBatter(false); }
  state.balls = 0; state.strikes = 0; updateScoreboard();
}

function nextBatter(wasOut) { if (wasOut) { state.outs += 1; state.bases = [false, false, false]; } state.batter = (state.batter + 1) % batters.length; if (state.outs >= 3) { state.inning += 1; state.outs = 0; addPlay(`End of inning ${state.inning - 1}. New frame, new energy.`); } renderBatter(); }
function resetGame() { clearTimeout(state.pitchTimer); Object.assign(state, { batter: 0, inning: 1, outs: 0, strikes: 0, balls: 0, away: 0, home: 0, bases: [false, false, false], pitchReady: false, pitchStartedAt: 0, pitchTimer: null, plays: 1 }); $('#runnerLayer').replaceChildren(); $('.pitcher').classList.remove('throwing'); $('.batter').classList.remove('swing-contact', 'swing-power', 'swing-miss'); $('#playLog').innerHTML = '<li class="active">Game ready. Step into the box.</li>'; setText('#fieldCallout', 'READY?'); setText('#pitchRead', 'Awaiting pitcher'); setText('#pitchHint', 'Watch the marker, then choose your swing.'); $('#pitchButton').disabled = false; renderBatter(); updateScoreboard(); }

$('#pitchButton').addEventListener('click', throwPitch); document.querySelectorAll('[data-swing]').forEach((button) => button.addEventListener('click', () => swing(button.dataset.swing))); $('#resetButton').addEventListener('click', resetGame); $('#soundButton').addEventListener('click', (event) => { event.currentTarget.classList.toggle('muted'); event.currentTarget.textContent = event.currentTarget.classList.contains('muted') ? '×' : '♪'; });
document.querySelectorAll('[data-sort]').forEach((button) => button.addEventListener('click', () => { tableState.direction = tableState.sort === button.dataset.sort && tableState.direction === 'desc' ? 'asc' : 'desc'; tableState.sort = button.dataset.sort; renderStats(); }));
document.addEventListener('keydown', (event) => { if (event.code === 'Space') { event.preventDefault(); state.pitchReady ? swing('contact') : throwPitch(); } if (event.key === 'Shift') swing('power'); });
renderBatter(); renderStats(); updateScoreboard();
