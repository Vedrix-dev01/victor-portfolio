"use client";

import { useEffect, useState } from "react";
import { Frame, type Shot } from "./Frame";

export function Effects() {
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav-links a"));
    const sections = links
      .map((a) => document.querySelector<HTMLElement>(a.getAttribute("href") || "#none"))
      .filter((s): s is HTMLElement => Boolean(s));

    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.35;
      let current = "";
      sections.forEach((s) => {
        if (s.offsetTop <= y) current = `#${s.id}`;
      });
      links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === current));
    };
    onScroll();
    // Section links: sections further down are sized by estimate until they are
    // drawn, so after the scroll ends, land exactly on the target if it moved.
    const onJump = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = a?.getAttribute("href");
      const target = id && id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
      if (!target) return;
      let tries = 0;
      const settle = () => {
        const off = target.getBoundingClientRect().top - 72;
        if (Math.abs(off) > 10 && tries < 3) {
          tries += 1;
          window.scrollBy({ top: off, behavior: tries > 1 ? "auto" : "smooth" });
          window.addEventListener("scrollend", settle, { once: true });
        }
      };
      window.addEventListener("scrollend", settle, { once: true });
    };
    document.addEventListener("click", onJump);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // 3D tilt: frames lean toward the pointer and a soft highlight follows it.
    // Mouse only, and off when the visitor prefers reduced motion.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Any real mouse drives the tilt, including on laptops with a touch screen.
    const canTilt = !calm;
    let active: HTMLElement | null = null;
    const stage = document.querySelector<HTMLElement>(".stage");
    const reset = (el: HTMLElement) => {
      el.classList.remove("tilting");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    const onMove = (e: PointerEvent) => {
      // Fingers never drive the tilt: a touch has no "leave", so it would stick.
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (active && active !== el) reset(active);
      active = el;
      if (el) {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.classList.add("tilting");
        // Large frames lean less, so the hero does not swing about.
        const k = Math.min(1, 520 / r.width);
        el.style.setProperty("--ry", `${(x - 0.5) * 10 * k}deg`);
        el.style.setProperty("--rx", `${(0.5 - y) * 8 * k}deg`);
        el.style.setProperty("--gx", `${x * 100}%`);
        el.style.setProperty("--gy", `${y * 100}%`);
      }
      if (stage) {
        const r = stage.getBoundingClientRect();
        const inside = e.clientY >= r.top && e.clientY <= r.bottom;
        stage.style.setProperty("--px", inside ? String((e.clientX - r.left) / r.width - 0.5) : "0");
        stage.style.setProperty("--py", inside ? String((e.clientY - r.top) / r.height - 0.5) : "0");
      }
    };
    if (canTilt) document.addEventListener("pointermove", onMove, { passive: true });

    // ---- Touch screens --------------------------------------------------
    // Depth comes from scrolling. Every value eases toward its target each
    // frame, so motion glides and settles instead of tracking the finger 1:1.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touchMotion = !fine && !reduced;
    const clamp = (n: number) => Math.max(-1, Math.min(1, n));
    type Ease = { rx: number; ry: number; iy: number };
    const eased = new WeakMap<HTMLElement, Ease>();
    let held: HTMLElement | null = null;
    let heldRy = 0;
    let stagePy = 0;
    let loop = 0;

    // Only frames near the screen are tracked, so off-screen cards cost nothing.
    const near = new Set<HTMLElement>();
    const watch = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) near.add(el);
          else near.delete(el);
          el.classList.toggle("near", e.isIntersecting);
        });
        kick();
      },
      { rootMargin: "25% 0px 25% 0px" }
    );
    const watchAll = () =>
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => watch.observe(el));
    // Cards that appear when the filter changes are picked up here.
    const grown = new MutationObserver(watchAll);

    const tick = () => {
      loop = 0;
      const vh = window.innerHeight;
      let moving = false;
      // Read every position first, then write, so the browser lays out once per frame.
      const reads: [HTMLElement, number][] = [];
      near.forEach((el) => {
        const r = el.getBoundingClientRect();
        reads.push([el, clamp((r.top + r.height / 2 - vh / 2) / (vh / 2))]);
      });
      let stageP: number | null = null;
      if (stage) {
        const r = stage.getBoundingClientRect();
        if (r.bottom > -200 && r.top < vh + 200) {
          stageP = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2));
        }
      }
      reads.forEach(([el, p]) => {
        // Lean a little as it passes; the screenshot inside drifts the other way.
        const target = { rx: p * 5, ry: el === held ? heldRy : 0, iy: p };
        const now = eased.get(el) ?? { rx: target.rx, ry: 0, iy: target.iy };
        now.rx += (target.rx - now.rx) * 0.3;
        now.ry += (target.ry - now.ry) * 0.34;
        now.iy += (target.iy - now.iy) * 0.3;
        if (
          Math.abs(target.rx - now.rx) > 0.02 ||
          Math.abs(target.ry - now.ry) > 0.02 ||
          Math.abs(target.iy - now.iy) > 0.004
        ) {
          moving = true;
        }
        eased.set(el, now);
        el.style.setProperty("--rx", `${now.rx.toFixed(2)}deg`);
        el.style.setProperty("--ry", `${now.ry.toFixed(2)}deg`);
        el.style.setProperty("--ip", now.iy.toFixed(3));
      });
      if (stage && stageP !== null) {
        stagePy += (stageP - stagePy) * 0.28;
        if (Math.abs(stageP - stagePy) > 0.002) moving = true;
        stage.style.setProperty("--py", stagePy.toFixed(3));
      }
      if (moving) loop = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!loop) loop = requestAnimationFrame(tick);
    };

    // The top bar slides away while reading down and returns on the way up.
    const nav = document.querySelector<HTMLElement>(".nav");
    let lastY = window.scrollY;
    const onTouchScroll = () => {
      kick();
      const y = window.scrollY;
      if (nav) {
        if (y > lastY + 6 && y > 140) nav.classList.add("nav-away");
        else if (y < lastY - 6 || y < 80) nav.classList.remove("nav-away");
      }
      lastY = y;
    };

    // A held frame turns toward the finger with a highlight under it, then
    // eases back. Buttons and chips give a light tap where the phone allows.
    const onPress = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const t = e.target as Element | null;
      if (t?.closest(".btn, .chip")) {
        try {
          navigator.vibrate?.(8);
        } catch {
          /* not supported */
        }
      }
      const el = t?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      held = el;
      heldRy = (x - 0.5) * 10;
      el.classList.add("tilting");
      el.style.setProperty("--gx", `${x * 100}%`);
      el.style.setProperty("--gy", `${y * 100}%`);
      kick();
    };
    const release = () => {
      if (!held) return;
      held.classList.remove("tilting");
      held = null;
      kick();
    };

    // Content settles into place the first time it is seen. Items that arrive
    // together follow one another by a beat.
    const reveal = new IntersectionObserver(
      (entries) => {
        let beat = 0;
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.setProperty("--beat", `${beat * 35}ms`);
          beat += 1;
          el.classList.add("rv-in");
          reveal.unobserve(el);
        });
      },
      { threshold: 0, rootMargin: "0px 0px 12% 0px" }
    );

    // iOS only shows pressed states when a touch listener exists.
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });

    // Set up after the page has finished becoming interactive, so it never
    // delays the first tap.
    const start = () => {
      if (touchMotion) {
        document.documentElement.classList.add("touch-motion");
        watchAll();
        const work = document.querySelector(".work");
        if (work) grown.observe(work, { childList: true });
        window.addEventListener("scroll", onTouchScroll, { passive: true });
        window.addEventListener("resize", kick);
        document.addEventListener("pointerdown", onPress, { passive: true });
        document.addEventListener("pointerup", release, { passive: true });
        document.addEventListener("pointercancel", release, { passive: true });
      } else {
        document.documentElement.classList.add("mouse-motion");
      }
      const vh = window.innerHeight;
      const below: HTMLElement[] = [];
      // Near the top of the page, only content that starts below the screen animates.
      document
        .querySelectorAll<HTMLElement>(".card, .jobs li, .sec h2, .sec-lede, .more-h, .stage-note")
        .forEach((el) => {
          if (el.getBoundingClientRect().top >= vh) below.push(el);
        });
      // These sit far down the page in sections the browser has not laid out yet,
      // so they are marked without measuring them.
      document
        .querySelectorAll<HTMLElement>(".svc-item, .more-item, .way")
        .forEach((el) => below.push(el));
      below.forEach((el) => {
        el.classList.add("rv");
        reveal.observe(el);
      });
    };
    let idle = 0;
    if (!reduced) {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback;
      if (ric) idle = ric(start, { timeout: 700 });
      else idle = window.setTimeout(start, 200);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("click", onJump);
      document.removeEventListener("touchstart", noop);
      window.removeEventListener("scroll", onTouchScroll);
      window.removeEventListener("resize", kick);
      document.removeEventListener("pointerdown", onPress);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", release);
      reveal.disconnect();
      watch.disconnect();
      grown.disconnect();
      const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (idle && cic) cic(idle);
      if (loop) cancelAnimationFrame(loop);
    };
  }, []);

  return null;
}

export type WorkItem = {
  name: string;
  kind: string;
  group: string;
  desc: string;
  stack: string;
  href: string;
  host: string;
  shot: Shot;
  tint: number;
};

export function WorkList({ items }: { items: WorkItem[] }) {
  const [filter, setFilter] = useState("All");
  const [swap, setSwap] = useState(0);
  const groups = ["All", ...Array.from(new Set(items.map((i) => i.group)))];
  const shown = filter === "All" ? items : items.filter((i) => i.group === filter);

  return (
    <>
      <div className="chips" role="group" aria-label="Filter projects">
        {groups.map((g) => {
          const count = g === "All" ? items.length : items.filter((i) => i.group === g).length;
          return (
            <button
              key={g}
              type="button"
              className={filter === g ? "chip chip-on" : "chip"}
              aria-pressed={filter === g}
              onClick={() => {
                if (g === filter) return;
                setFilter(g);
                setSwap((n) => n + 1);
              }}
            >
              {g} <span>{count}</span>
            </button>
          );
        })}
      </div>
      {/* The class alternates on each filter change, which replays the entrance
          without rebuilding the cards, so images do not reload. */}
      <div className={`work work-${swap % 2}`}>
        {shown.map((p) => (
          <a key={p.name} href={p.href} target="_blank" rel="noopener" className="card">
            <Frame name={p.name} host={p.host} shot={p.shot} tint={p.tint} />
            <div className="card-text">
              <div className="card-top">
                <h3 className="card-name">{p.name}</h3>
                <span className="card-kind">{p.kind}</span>
              </div>
              <p className="card-desc">{p.desc}</p>
              <p className="card-stack">{p.stack}</p>
              <span className="card-open">Open {p.host}</span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
