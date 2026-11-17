import ContactForm from "./components/ContactForm";
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

const live = projects.filter((p) => p.href);
const workItems = live.map((p) => ({
  name: p.name,
  kind: kind(p.tag),
  group: kind(p.tag) === "Mobile" ? "Mobile apps" : "Web apps",
  desc: plain(p.desc),
  stack: p.stack.map(plain).join(", "),
  href: p.href as string,
  host: host(p.href as string),
}));
const other = projects.filter((p) => !p.href);

export default function Home() {
  return (
    <>
      <Effects />
      <nav className="nav">
        <div className="wrap nav-in">
          <a href="#top" className="brand">victor</a>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#contact">Contact</a>
          </div>
          <a href={FIVERR_URL} target="_blank" rel="noopener" className="btn btn-gold btn-sm">
            Hire me on Fiverr
          </a>
        </div>
      </nav>

      <header id="top" className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1 className="display">
              <span className="block">Your app works in preview.</span>
              <span className="block">I get it live.</span>
            </h1>
            <p className="hero-sub">
              I&apos;m Victor, a full-stack developer. I take apps built with AI tools, fix what
              breaks, and ship them to the web, the App Store and Google Play.
            </p>
            <div className="hero-cta">
              <a href={FIVERR_URL} target="_blank" rel="noopener" className="btn btn-gold">
                Hire me on Fiverr
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn btn-line">
                Chat on WhatsApp
              </a>
            </div>
            <p className="hero-tools">
              I work with <strong>Lovable, Base44, Replit, Bolt, Emergent and Cursor</strong> builds.
            </p>
          </div>

          <div className="board">
            <div className="board-head">
              <span>Live right now</span>
              <span>{live.length} shipped apps</span>
            </div>
            {live.slice(0, 6).map((p, i) => (
              <a
                key={p.name}
                href={p.href as string}
                target="_blank"
                rel="noopener"
                className="board-row"
                style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              >
                <span className="dot" aria-hidden="true" />
                <span className="board-name">{p.name}</span>
                <span className="board-host">{host(p.href as string)}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      <section id="services" className="sec sec-dark">
        <div className="wrap">
          <h2 className="display" data-reveal>What I do</h2>
          <div className="svc">
            {services.map((s) => (
              <div key={s.title} className="svc-item" data-reveal>
                <h3>{s.title}</h3>
                <p>{plain(s.body)}</p>
                <div className="svc-tags">{s.tags.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="sec sec-paper">
        <div className="wrap">
          <h2 className="display" data-reveal>Shipped work</h2>
          <p className="sec-lede">Every project below is live. Open any of them and try it.</p>
          <WorkList items={workItems} />

          <h3 className="more-h" data-reveal>More client work</h3>
          <p className="sec-lede">Builds without a public link, including work still in progress.</p>
          <div className="more">
            {other.map((p) => (
              <div key={p.name} className="more-item" data-reveal>
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

      <section id="contact" className="sec sec-dark">
        <div className="wrap contact-grid">
          <div data-reveal>
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
          <div data-reveal>
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
