export function parseRoute(hash = "") {
  const path = hash.replace(/^#\/?/, "").replace(/\/$/, "") || "home";
  const [name, value] = path.split("/");
  if (name === "home") return { name: "home" };
  if (name === "review" && value) return { name: "review", step: value };
  if (["quiz", "mistakes"].includes(name) && /^\d+$/.test(value || "")) return { name, index: Number(value) };
  if (name === "results") return { name: "results" };
  return { name: "not-found" };
}

export function createRouter(browserWindow) {
  const listeners = new Set();
  const notify = () => listeners.forEach((listener) => listener(parseRoute(browserWindow.location.hash)));
  browserWindow.addEventListener("hashchange", notify);
  return {
    current: () => parseRoute(browserWindow.location.hash),
    go(path, { replace = false } = {}) {
      const hash = `#/${path.replace(/^\//, "")}`;
      if (replace) {
        browserWindow.history.replaceState(null, "", hash);
        notify();
      } else if (browserWindow.location.hash === hash) {
        notify();
      } else {
        browserWindow.location.hash = hash;
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

