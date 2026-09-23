import { PARTNERS } from "@/lib/partners";

/**
 * A continuously scrolling row of partner/press logos. The track renders
 * the list twice back-to-back and animates from 0 to -50%, so the loop is
 * seamless as long as both copies are identical widths (they always are,
 * since they're the same array).
 */
export function PartnerMarquee() {
  if (PARTNERS.length === 0) return null;
  const track = [...PARTNERS, ...PARTNERS];

  return (
    <div className="overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-16 hover:[animation-play-state:paused]">
        {track.map((partner, i) => (
          <a
            key={`${partner.name}-${i}`}
            href={partner.href}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-3 transition hover:opacity-80"
          >
            <img src={partner.logo} alt={partner.alt} className="h-10 w-auto object-contain" />
            <span className="text-lg font-semibold text-foreground">{partner.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
