export const getNameAndSlug = (name: string): string[] => {
  const categoryName = name?.trim().toLowerCase();
  console.error('categoryName', categoryName);
  const categorySlug = categoryName.replace(/ /g, '-');

  return [categoryName, categorySlug];
};
