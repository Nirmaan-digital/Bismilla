// A short two-note chime for new alerts while the app/website is open.
// Synthesised with the Web Audio API, so no sound file is needed. Browsers
// only allow sound after the user has tapped the page at least once, which
// is always true once someone is logged in and using it.
let ctx = null;

export const playChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = ctx || new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    [
      { freq: 880, start: 0 },
      { freq: 1318.5, start: 0.16 },
    ].forEach(({ freq, start }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.35, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + 0.45);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + 0.5);
    });
    if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
  } catch {
    /* sound is a nice-to-have */
  }
};
