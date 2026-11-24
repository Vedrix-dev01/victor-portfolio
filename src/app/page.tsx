import fs from "fs";
import Image from "next/image";
import path from "path";
import ContactForm from "./components/ContactForm";
import { Frame, type Shot } from "./components/Frame";
import { Effects, WorkList } from "./components/Effects";
import { services, projects, FIVERR_URL, GITHUB_URL, EMAIL } from "@/lib/data";

const MAILTO =
  `mailto:${EMAIL}?subject=New%20project%20inquiry&body=Hi%20Victor%2C%0A%0AI%27d%20like%20to%20work%20with%20you%20on%3A%0A%0A-%20Project%3A%20%0A-%20Platform%2Fstack%3A%20%0A-%20Where%20it%27s%20stuck%3A%20%0A-%20Timeline%2Fbudget%3A%20%0A%0AThanks%2C%0A`;

const WHATSAPP_URL = "https://wa.me/2348123421589";

const KINDS: Record<string, string> = {
  AI: "AI",
  "AI AGENT": "AI agent",
  ERP: "ERP",
  SAAS: "SaaS",
  DEVOPS: "DevOps",
};

function kind(tag: string) {
  const k = tag.split(" · ")[0];
  return KINDS[k] ?? k.charAt(0) + k.slice(1).toLowerCase();
}

function plain(text: string) {
  return text.replace(/ — /g, ", ").replace(/ · /g, ", ").replace(/→/g, " to ");
}

function host(href: string) {
  const h = href.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
  return h === "apps.apple.com" ? "App Store" : h;
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* Screenshots are captured by scripts/shots.mjs, which writes this manifest.
   A project with no entry falls back to a name tile. */
function readShots(): Record<string, Shot> {
  try {
    const file = path.join(process.cwd(), "public", "shots", "manifest.json");
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}
const shots = readShots();

const live = projects.filter((p) => p.href);
const workItems = live.map((p, i) => ({
  shot: shots[slug(p.name)] ?? null,
  tint: i,
  name: p.name,
  kind: kind(p.tag),
  group: kind(p.tag) === "Mobile" ? "Mobile apps" : "Web apps",
  desc: plain(p.desc),
  stack: p.stack.map(plain).join(", "),
  href: p.href as string,
  host: host(p.href as string),
}));
const other = projects.filter((p) => !p.href);

const jobs = [
  { title: "Build", body: "Web apps, mobile apps and websites from scratch, front end and backend." },
  { title: "Fix and finish", body: "Take over AI-built or half-done apps: bugs, sign-in, payments, database security." },
  { title: "Launch", body: "Domain, hosting you own, and App Store and Google Play submission through review." },
  { title: "AI agents", body: "Client support, lead intake, booking and payment follow-up agents, connected to the tools you already use." },
];
const heroWeb =
  workItems.find((p) => p.shot?.kind === "web") ?? workItems.find((p) => p.shot?.kind !== "phone");
const heroPhone = workItems.find((p) => p.shot?.kind === "phone");

export default function Home() {
  return (
    <>
      <Effects />
      <nav className="nav">
        <div className="wrap nav-in">
          <a href="#top" className="brand">victor</a>
          <div className="nav-links">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
          </div>
          <a href="#contact" className="btn btn-ink btn-sm nav-cta">
            Get a quote
          </a>
        </div>
      </nav>

      <header id="top" className="hero">
        <div className="wrap">
          <h1 className="display">
            <span className="block">I build apps, websites</span>
            <span className="block">and AI agents,</span>
            <span className="block">and I get them live.</span>
          </h1>
          <p className="hero-sub">
            I&apos;m Victor, a full-stack developer. I build web apps, mobile apps and websites
            from scratch, and AI agents that handle client support, lead intake and payment
            follow-up. I also take over apps started in Lovable, Base44, Replit, Bolt, Emergent
            or Cursor, fix them, and take them through launch.
          </p>
          <ul className="jobs">
            {jobs.map((j) => (
              <li key={j.title}>
                <strong>{j.title}</strong>
                <span>{j.body}</span>
              </li>
            ))}
          </ul>
          <div className="hero-cta">
            <a href="#work" className="btn btn-ink">
              See shipped work
            </a>
            <a href="#contact" className="btn btn-line">
              Get a quote
            </a>
          </div>
        </div>

        <div className="wrap">
          <div className="stage">
            {heroWeb && (
              <a href={heroWeb.href} target="_blank" rel="noopener" className="stage-web">
                <Frame
                  name={heroWeb.name}
                  host={heroWeb.host}
                  shot={heroWeb.shot}
                  tint={heroWeb.tint}
                  priority
                  sizes="(min-width: 900px) 880px, 100vw"
                />
              </a>
            )}
            {heroPhone && heroPhone.shot?.kind === "phone" && (
              <a href={heroPhone.href} target="_blank" rel="noopener" className="stage-phone">
                <div className="phone" data-tilt>
                  <Image
                    src={`/shots/${heroPhone.shot.file}`}
                    alt={`${heroPhone.name} on iPhone`}
                    fill
                    sizes="260px"
                    priority
                  />
                </div>
              </a>
            )}
          </div>
          <p className="stage-note">
            {live.length} apps live right now, including {heroWeb?.name}
            {heroPhone?.shot?.kind === "phone" ? ` and ${heroPhone.name}` : ""}. Every one is
            below with its link.
          </p>
        </div>
      </header>

      <section id="work" className="sec">
        <div className="wrap">
          <h2 className="display">Shipped work</h2>
          <p className="sec-lede">Every project below is live. Open any of them and try it.</p>
          <WorkList items={workItems} />

          <h3 className="more-h">More client work</h3>
          <p className="sec-lede">Builds without a public link, including work still in progress.</p>
          <div className="more">
            {other.map((p) => (
              <div key={p.name} className="more-item">
                <div className="more-top">
                  <span className="more-name">{p.name}</span>
                  {p.tag.includes("IN PROGRESS") && <span className="badge">In progress</span>}
                </div>
                <p>{plain(p.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="sec sec-tint">
        <div className="wrap">
          <h2 className="display">What I do</h2>
          <div className="svc">
            {services.map((s) => (
              <div key={s.title} className="svc-item">
                <h3>{s.title}</h3>
                <p>{plain(s.body)}</p>
                <div className="svc-tags">{s.tags.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="sec sec-pine">
        <div className="wrap contact-grid">
          <div>
            <h2 className="display">Tell me where it is stuck</h2>
            <p className="sec-lede">
              Send the app link and what is breaking. I reply with a clear scope and a price.
            </p>
            <div className="ways">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="way">
                WhatsApp<span>Chat with me</span>
              </a>
              <a href={MAILTO} className="way">
                Email<span>{EMAIL}</span>
              </a>
              <a href={FIVERR_URL} target="_blank" rel="noopener" className="way">
                Fiverr<span>View my gigs</span>
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noopener" className="way">
                GitHub<span>Vedrixappsheet</span>
              </a>
            </div>
          </div>
          <div>
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">© 2026 victor</div>
      </footer>
    </>
  );
}
