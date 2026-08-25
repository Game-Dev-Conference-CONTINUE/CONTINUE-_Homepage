import { content } from "@/data/content";
import { Button, Eyebrow, Section, Title } from "./ui";

export function VenueSection() {
  const { venue } = content;

  return (
    <Section id="venue" className="border-t border-line">
      <Eyebrow>Venue</Eyebrow>
      <Title>오시는 길</Title>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <p className="text-2xl font-bold text-ink">{venue.name}</p>
          {venue.address && <p className="mt-2 text-muted">{venue.address}</p>}

          {venue.mapUrl && (
            <div className="mt-6">
              <Button href={venue.mapUrl} external variant="outline">
                지도에서 보기
              </Button>
            </div>
          )}
        </div>

        <div>
          {venue.transit.length > 0 && (
            <ul className="space-y-3">
              {venue.transit.map((t, i) => (
                <li key={i} className="flex gap-3 text-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          )}
          {venue.note && (
            <p className="mt-6 border-l-2 border-line pl-4 text-sm text-dim">{venue.note}</p>
          )}
        </div>
      </div>
    </Section>
  );
}
