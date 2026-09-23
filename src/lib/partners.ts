/**
 * Partners/press shown in the floating marquee on the homepage. Each entry
 * needs a logo file in /public/partners/ (see the placeholder already
 * there), a link, and accessible alt text.
 *
 * Only add an entry here if you actually have the right to display that
 * logo - check the partner's own brand guidelines first. Being featured in
 * an article or wiki page is not the same as a partnership; word the label
 * accordingly (e.g. "Featured on X" vs "Partner: X") unless you have
 * explicit permission to say otherwise.
 */
export interface Partner {
  name: string;
  logo: string;
  href: string;
  alt: string;
}

export const PARTNERS: Partner[] = [
  {
    name: "IQ.wiki",
    logo: "/partners/iqwiki-logo.svg",
    href: "https://iq.wiki/wiki/rashito",
    alt: "IQ.wiki logo",
  },
];
