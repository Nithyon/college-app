import type { UiBlock } from "@/types/chat";

export function UiBlocksRenderer({ blocks }: { blocks: UiBlock[] }) {
  return (
    <div className="mt-4 space-y-4 font-body text-sm text-[var(--color-text)]">
      {blocks.map((b, i) => {
        if (b.type === "fees") {
          return (
            <div key={i} className="bg-[var(--color-surface)] p-4">
              <p className="mb-2 text-[var(--color-text-muted)]">Official fee references</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-[var(--color-border)] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="border-r border-[var(--color-border)] p-2">Course</th>
                      <th className="border-r border-[var(--color-border)] p-2">Year</th>
                      <th className="border-r border-[var(--color-border)] p-2">Tuition</th>
                      <th className="border-r border-[var(--color-border)] p-2">Hostel</th>
                      <th className="p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-b border-[var(--color-border)]">
                        <td className="border-r border-[var(--color-border)] p-2">{r.course}</td>
                        <td className="border-r border-[var(--color-border)] p-2">{r.year}</td>
                        <td className="border-r border-[var(--color-border)] p-2">{r.tuition}</td>
                        <td className="border-r border-[var(--color-border)] p-2">{r.hostel ?? "—"}</td>
                        <td className="p-2">{r.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-[var(--color-text-muted)]">Official program references</p>
              <div className="overflow-x-auto">
                <table className="mt-2 w-full border-collapse border border-[var(--color-border)] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="border-r border-[var(--color-border)] p-2">Year</th>
                      <th className="border-r border-[var(--color-border)] p-2">B.Tech</th>
                      <th className="border-r border-[var(--color-border)] p-2">M.Tech</th>
                      <th className="p-2">MBA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.history.map((h, j) => (
                      <tr key={j} className="border-b border-[var(--color-border)]">
                        <td className="border-r border-[var(--color-border)] p-2">{h.academicYear}</td>
                        <td className="border-r border-[var(--color-border)] p-2">{h.btech}</td>
                        <td className="border-r border-[var(--color-border)] p-2">{h.mtech}</td>
                        <td className="p-2">{h.mba}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-justify text-xs leading-relaxed text-[var(--color-text-muted)]">
                {b.scholarshipNote}
              </p>
              {b.sourceLinks?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {b.sourceLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-[var(--color-border)] px-3 py-2 text-xs uppercase tracking-widest"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          );
        }
        if (b.type === "contact") {
          const d = b.data;
          const links: { label: string; href: string }[] = [
            { label: "Instagram", href: d.instagram },
            { label: "LinkedIn", href: d.linkedin },
            { label: "Website", href: d.website },
          ];
          return (
            <div key={i} className="bg-[var(--color-surface)] p-4">
              <p className="font-display text-lg tracking-wide text-[var(--color-text)]">Connect With Us</p>
              <dl className="mt-3 space-y-2 font-body text-xs">
                <div>
                  <dt className="text-[var(--color-text-muted)]">Official email</dt>
                  <dd>{d.officialEmail}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Admissions</dt>
                  <dd>{d.admissionsEmail}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Helpdesk</dt>
                  <dd>{d.supportEmail}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Phone</dt>
                  <dd>{d.phone}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Address</dt>
                  <dd className="text-justify">{d.address}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[var(--color-border)] px-3 py-2 text-xs uppercase tracking-widest"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          );
        }
        if (b.type === "research") {
          return (
            <div key={i} className="bg-[var(--color-surface)] p-4">
              <p className="text-justify font-body text-xs leading-relaxed">{b.summary}</p>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                Categories: {b.categories.join(" · ")}
              </p>
              <a
                href={b.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block border border-[var(--color-border)] px-3 py-2 text-xs uppercase tracking-widest"
              >
                Browse Faculty Research Portal →
              </a>
            </div>
          );
        }
        if (b.type === "examCta") {
          return (
            <div key={i}>
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-[var(--color-border)] px-3 py-2 text-xs uppercase tracking-widest"
              >
                {b.label}
              </a>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
