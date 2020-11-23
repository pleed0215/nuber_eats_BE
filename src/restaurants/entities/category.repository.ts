import { getNameAndSlug } from 'src/common/common.utilities';
import { EntityRepository, Repository } from 'typeorm';
import { Category } from './category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async findOrCreate(name: string): Promise<Category> {
    const [categoryName, categorySlug] = getNameAndSlug(name);

    let category = await this.findOne({ slug: categorySlug });
    if (!category) {
      category = await this.create({
        slug: categorySlug,
        name: categoryName,
        image: '',
      });
      await this.save(category);
    }
    return category;
  }
}
