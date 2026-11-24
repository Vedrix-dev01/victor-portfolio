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
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // 3D tilt: frames lean toward the pointer and a soft highlight follows it.
    // Mouse only, and off when the visitor prefers reduced motion.
    const canTilt =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let active: HTMLElement | null = null;
    const stage = document.querySelector<HTMLElement>(".stage");
    const reset = (el: HTMLElement) => {
      el.classList.remove("tilting");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    const onMove = (e: PointerEvent) => {
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

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("pointermove", onMove);
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
              onClick={() => setFilter(g)}
            >
              {g} <span>{count}</span>
            </button>
          );
        })}
      </div>
      <div className="work">
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
