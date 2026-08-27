import { Link } from "@tanstack/react-router";
import { Github, MessageCircle, Send, Twitter } from "lucide-react";
import { Logo, NAV_LINKS } from "@/components/site-header";
import { SOCIAL_LINKS } from "@/lib/social";

const SOCIAL_ICONS = [
  { key: "x", href: SOCIAL_LINKS.x, label: "X (Twitter)", Icon: Twitter },
  { key: "discord", href: SOCIAL_LINKS.discord, label: "Discord", Icon: MessageCircle },
  { key: "telegram", href: SOCIAL_LINKS.telegram, label: "Telegram", Icon: Send },
  { key: "github", href: SOCIAL_LINKS.github, label: "GitHub", Icon: Github },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {SOCIAL_ICONS.filter((s) => s.href).map(({ key, href, label, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="hover:text-foreground"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
        <span>© {new Date().getFullYear()} Rashito</span>
      </div>
    </footer>
  );
}
