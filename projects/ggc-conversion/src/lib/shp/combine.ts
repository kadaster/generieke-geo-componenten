const combine = (base: string, type?: string): string => {
  if (!type) {
    return base;
  }
  const url = new URL(base);
  url.pathname = `${url.pathname}.${type}`;
  return url.href;
};

export default combine;
