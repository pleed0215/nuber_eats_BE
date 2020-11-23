export const getNameAndSlug = (name: string): string[] => {
  const categoryName = name?.trim().toLowerCase();
  const categorySlug = categoryName.replace(/ /g, '-');

  return [categoryName, categorySlug];
};
