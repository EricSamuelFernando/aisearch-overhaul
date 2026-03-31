type PreloadOptions = {
  maxConcurrent?: number;
  maxTotal?: number;
  idleTimeoutMs?: number;
};

const globalSeen =
  (typeof window !== 'undefined' && (window as any).__photoPreloadSeen) ||
  new Set<string>();

if (typeof window !== 'undefined') {
  (window as any).__photoPreloadSeen = globalSeen;
}

const defaultOptions: Required<PreloadOptions> = {
  maxConcurrent: 6,
  maxTotal: Number.POSITIVE_INFINITY,
  idleTimeoutMs: 1500,
};

export const preloadImageUrls = (
  inputUrls: Array<string | null | undefined>,
  options: PreloadOptions = {},
) => {
  if (typeof window === 'undefined') return;
  const { maxConcurrent, maxTotal, idleTimeoutMs } = {
    ...defaultOptions,
    ...options,
  };

  const urls = inputUrls.filter(Boolean) as string[];
  if (urls.length === 0) return;

  const run = () => {
    let inFlight = 0;
    let idx = 0;
    const limited = urls.slice(0, maxTotal);

    const kick = () => {
      while (inFlight < maxConcurrent && idx < limited.length) {
        const url = limited[idx++];
        if (globalSeen.has(url)) continue;
        globalSeen.add(url);
        inFlight += 1;
        const image = new Image();
        image.src = url;
        const done = () => {
          inFlight -= 1;
          kick();
        };
        if ('decode' in image) {
          image.decode().then(done).catch(done);
        } else {
          image.onload = done;
          image.onerror = done;
        }
      }
    };

    kick();
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(run, { timeout: idleTimeoutMs });
  } else {
    setTimeout(run, 0);
  }
};
