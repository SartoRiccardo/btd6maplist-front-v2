import { ref, watch, onMounted, onUnmounted, type MaybeRefOrGetter, toValue } from 'vue';

export function useFireEffect(active: MaybeRefOrGetter<boolean | undefined>) {
  const containerRef = ref<HTMLElement | null>(null);
  let particleInterval: ReturnType<typeof setInterval> | undefined;
  let emberInterval: ReturnType<typeof setInterval> | undefined;

  function spawnParticle() {
    const el = containerRef.value;
    if (!el) return;
    const p = document.createElement('div');
    p.className = 'fire-particle';

    const rect = el.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    const edge = Math.random();
    let x: number, y: number;
    if (edge < 0.3) { x = Math.random() * W; y = H; }
    else if (edge < 0.55) { x = 0; y = Math.random() * H; }
    else if (edge < 0.8) { x = W; y = Math.random() * H; }
    else { x = Math.random() * W; y = 0; }

    const t = Math.random();
    const g = Math.round(t < 0.5 ? t * 2 * 180 : 180 - (t - 0.5) * 2 * 60);
    p.style.background = `rgb(255,${g},0)`;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty('--drift', `${Math.random() * 30 - 15}px`);
    const dur = 0.6 + Math.random() * 0.8;
    p.style.animationDuration = `${dur}s`;
    const size = 6 + Math.random() * 10;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;

    el.appendChild(p);
    setTimeout(() => p.remove(), dur * 1000);
  }

  function spawnEmber() {
    const el = containerRef.value;
    if (!el) return;
    const e = document.createElement('div');
    e.className = 'fire-ember';

    const rect = el.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    const side = Math.random();
    let x: number, y: number;
    if (side < 0.25) { x = Math.random() * W; y = H; }
    else if (side < 0.5) { x = 0; y = Math.random() * H; }
    else if (side < 0.75) { x = W; y = Math.random() * H; }
    else { x = Math.random() * W; y = 0; }

    e.style.left = `${x}px`;
    e.style.top = `${y}px`;
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    e.style.setProperty('--ex', `${Math.cos(angle) * dist}px`);
    e.style.setProperty('--ey', `${Math.sin(angle) * dist}px`);
    const dur = 0.8 + Math.random() * 1.2;
    e.style.animationDuration = `${dur}s`;

    el.appendChild(e);
    setTimeout(() => e.remove(), dur * 1000);
  }

  function start() {
    stop();
    particleInterval = setInterval(spawnParticle, 40);
    emberInterval = setInterval(spawnEmber, 80);
    for (let i = 0; i < 15; i++) setTimeout(spawnParticle, i * 30);
  }

  function stop() {
    if (particleInterval) { clearInterval(particleInterval); particleInterval = undefined; }
    if (emberInterval) { clearInterval(emberInterval); emberInterval = undefined; }
  }

  watch(() => toValue(active), (val) => {
    if (val) start();
    else stop();
  });

  onMounted(() => {
    if (toValue(active)) start();
  });

  onUnmounted(() => {
    stop();
  });

  return { containerRef };
}
