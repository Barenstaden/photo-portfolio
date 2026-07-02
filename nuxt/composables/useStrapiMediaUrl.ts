export const useStrapiMediaUrl = () => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapi?.url ?? config.public.baseURL ?? '';

  return (url?: string | null) => {
    if (!url) return '';

    if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }

    return new URL(url, strapiUrl).toString();
  };
};
