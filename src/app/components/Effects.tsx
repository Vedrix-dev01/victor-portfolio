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
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
