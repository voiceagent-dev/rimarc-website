import { useEffect } from "react";
import { ORIGIN, PAGES, type PagePath } from "../data/seo";

/** Updates the tab title, description and canonical link when the visitor moves between pages. */
export function usePageMeta(path: PagePath) {
  useEffect(() => {
    const { title, description } = PAGES[path];
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    if (path !== "/404") document.querySelector('link[rel="canonical"]')?.setAttribute("href", ORIGIN + path);
  }, [path]);
}
