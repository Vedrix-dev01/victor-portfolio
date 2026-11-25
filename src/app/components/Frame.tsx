import Image from "next/image";

export type Shot = { file: string; kind: "web" | "phone" } | null;

type Props = {
  name: string;
  host: string;
  shot: Shot;
  tint: number;
  priority?: boolean;
  sizes?: string;
};

/* A screenshot in the frame it ships in: a browser window showing the live
   address, or a phone for App Store apps. Without a screenshot the frame
   shows the project name instead. */
export function Frame({ name, host, shot, tint, priority, sizes }: Props) {
  if (shot?.kind === "phone") {
    return (
      <div className={`stagebox tint-${tint % 4}`} data-tilt>
        <div className="phone">
          <Image
            src={`/shots/${shot.file}`}
            alt={`${name} on iPhone`}
            fill
            sizes="(max-width: 767px) 132px, 200px"
            priority={priority}
          />
        </div>
        <span className="stage-host">
          <i className="dot" aria-hidden="true" />
          {host}
        </span>
      </div>
    );
  }
  return (
    <div className="browser" data-tilt>
      <div className="browser-bar">
        <span className="browser-url">
          <i className="dot" aria-hidden="true" />
          {host}
        </span>
      </div>
      <div className={`browser-view tint-${tint % 4}`}>
        {shot ? (
          <Image
            src={`/shots/${shot.file}`}
            alt={`${name} home page`}
            fill
            sizes={sizes ?? "(min-width: 900px) 560px, 100vw"}
            priority={priority}
          />
        ) : (
          <span className="browser-name" aria-hidden="true">{name}</span>
        )}
      </div>
    </div>
  );
}
