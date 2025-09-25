type ImageLoader = {
  src?: any;
  width?: any;
  quality?: any;
};
export const imageLoader = ({ src, width, quality }: ImageLoader) => {
  const baseUrl = src.split('?')[0];
  return `${baseUrl}?w=${width}&q=${quality || 75}`;
};
