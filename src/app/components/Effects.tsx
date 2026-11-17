"use client";

import { useEffect, useState } from "react";

export function Effects() {
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".progress");
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav-links a"));
    const sections = links
      .map((a) => document.querySelector<HTMLElement>(a.getAttribute("href") || "#none"))
      .filter((s): s is HTMLElement => Boolean(s));

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
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

    const hero = document.querySelector<HTMLElement>(".hero");
    const onMove = (e: PointerEvent) => {
      if (!hero) return;
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    hero?.addEventListener("pointermove", onMove);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => obs.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      hero?.removeEventListener("pointermove", onMove);
      obs.disconnect();
    };
  }, []);

  return <div className="progress" aria-hidden="true" />;
}

export type WorkItem = {
  name: string;
  kind: string;
  group: string;
  desc: string;
  stack: string;
  href: string;
  host: string;
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
        {shown.map((p, i) => (
          <a
            key={`${filter}-${p.name}`}
            href={p.href}
            target="_blank"
            rel="noopener"
            className="work-row work-in"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div>
              <div className="work-name">{p.name}</div>
              <div className="work-kind">{p.kind}</div>
            </div>
            <div>
              <p className="work-desc">{p.desc}</p>
              <div className="work-stack">{p.stack}</div>
            </div>
            <span className="work-host">{p.host}</span>
          </a>
        ))}
      </div>
    </>
  );
}
