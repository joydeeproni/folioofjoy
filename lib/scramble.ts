import gsap from 'gsap';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?';

// Scramble one label into another, e.g. on hover. Runs at the width of the
// longer of the two strings so the noise doesn't pop, locks the target in from
// the left, and lets the trailing noise shrink down to the target's length.
export function scrambleSwap(
  el: HTMLElement,
  from: string,
  to: string,
  duration: number = 0.4
): gsap.core.Tween {
  const width = Math.max(from.length, to.length);
  const progress = { value: 0 };

  return gsap.to(progress, {
    value: 1,
    duration,
    // Near-linear on purpose: an eased curve front-loads the lock-in and leaves
    // the last character flickering alone for a third of the run, which reads as
    // a stutter rather than a scramble.
    ease: 'power1.inOut',
    onUpdate: () => {
      const p = progress.value;
      const revealed = Math.floor(p * to.length);
      const noiseLen = Math.round(width - (width - to.length) * p);
      let result = '';
      for (let i = 0; i < noiseLen; i++) {
        const c = to[i];
        if (i < revealed || c === ' ') result += c ?? '';
        else result += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = result;
    },
    onComplete: () => {
      el.textContent = to;
    },
  });
}

// Animate `finalText` into `el` by filling the container with random chars and
// progressively locking each character in from left to right. Spaces and
// newlines are preserved to maintain layout.
export function scrambleReveal(
  el: HTMLElement,
  finalText: string,
  duration: number,
  delay: number = 0
): gsap.core.Tween {
  const length = finalText.length;
  const progress = { value: 0 };
  const initial = Array.from({ length }, (_, i) => {
    const c = finalText[i];
    return c === ' ' || c === '\n' ? c : CHARS[Math.floor(Math.random() * CHARS.length)];
  }).join('');
  el.textContent = initial;

  return gsap.to(progress, {
    value: 1,
    duration,
    delay,
    ease: 'power2.inOut',
    onUpdate: () => {
      const revealed = Math.floor(progress.value * length);
      let result = '';
      for (let i = 0; i < length; i++) {
        const c = finalText[i];
        if (c === ' ' || c === '\n') result += c;
        else if (i < revealed) result += c;
        else result += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = result;
    },
    onComplete: () => {
      el.textContent = finalText;
    },
  });
}
