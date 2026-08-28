/**
 * Instantly scrolls window, document, body, and all scrollable container elements
 * to top: 0, left: 0 when navigating between pages or switching tabs/steps.
 */
export function forceScrollToTop() {
  if (typeof window === 'undefined') return;

  // 1. Instant window & root element scroll
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  } catch {
    window.scrollTo(0, 0);
  }

  if (document.body) {
    document.body.scrollTop = 0;
  }
  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
  }

  // 2. Instant scroll for any scrollable sub-container
  try {
    const containers = document.querySelectorAll('div, main, section, article, aside, body, html, #root, .app-container, .main-content');
    containers.forEach((el) => {
      if (el && el.scrollTop && el.scrollTop > 0) {
        el.scrollTop = 0;
      }
    });
  } catch {}
}

export default forceScrollToTop;
