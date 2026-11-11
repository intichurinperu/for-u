import { useEffect } from "react";
import type { LandingDraft } from "./types";

export function useSiteSeo(
  site: LandingDraft | null,
  slug: string | undefined,
  loading: boolean,
) {
  useEffect(() => {
    if (loading) return;
    const title = document.title;
    const undo: (() => void)[] = [];
    document.title = site
      ? site.headline + " | " + site.name
      : "Página no disponible | FOR U";
    const meta = (key: string, value: string, property = false) => {
      const attribute = property ? "property" : "name";
      let element = document.head.querySelector<HTMLMetaElement>(
        "meta[" + attribute + '="' + key + '"]',
      );
      if (element) {
        const previous = element.content;
        undo.push(() => {
          element!.content = previous;
        });
      } else {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.append(element);
        undo.push(() => element!.remove());
      }
      element.content = value;
    };
    meta(
      "description",
      site?.description.slice(0, 160) ?? "Esta página no está publicada.",
    );
    meta("robots", site ? "index,follow" : "noindex,nofollow");
    meta("og:title", document.title, true);
    meta("og:description", site?.description.slice(0, 200) ?? "", true);
    meta("og:type", "website", true);
    if (site && slug) {
      const url = window.location.origin + "/s/" + encodeURIComponent(slug);
      meta("og:url", url, true);
      const previous = document.head.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      );
      const link = previous ?? document.createElement("link");
      const oldHref = link.getAttribute("href");
      link.rel = "canonical";
      link.href = url;
      if (!previous) document.head.append(link);
      undo.push(() => {
        if (!previous) link.remove();
        else if (oldHref !== null) link.setAttribute("href", oldHref);
        else link.removeAttribute("href");
      });
      const schema = document.createElement("script");
      schema.type = "application/ld+json";
      schema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.name,
        description: site.description,
        url,
      });
      document.head.append(schema);
      undo.push(() => schema.remove());
    }
    return () => {
      document.title = title;
      undo.forEach((restore) => restore());
    };
  }, [site, slug, loading]);
}
