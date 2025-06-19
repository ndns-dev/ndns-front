export const scrollToElement = (element: HTMLElement | null) => {
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

export const isScrolled = (threshold = 300): boolean => {
  if (typeof window === 'undefined') return false;
  return window.scrollY > threshold;
};
