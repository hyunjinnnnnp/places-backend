import { PlaceUserRelation } from 'src/place-user-relations/entities/place-user-relation.entity';
import { EntityRepository, Repository } from 'typeorm';
import { PAGINATION_PAGE } from '../../common/common.constants';

@EntityRepository(PlaceUserRelation)
export class PaginationRepository extends Repository<PlaceUserRelation> {
  async getResults(page: number, where?: object) {
    const result = await this.findAndCount({
      where,
      take: PAGINATION_PAGE,
      skip: (page - 1) * PAGINATION_PAGE,
    });
    return result;
  }
}
