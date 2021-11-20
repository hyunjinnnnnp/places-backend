import { Injectable } from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';
import { PAGINATION_NUMBER } from './common.constants';

@Injectable()
export class Pagination {
  constructor() {}
  async getResults(repository: ObjectLiteral, page: number, where?: object) {
    const result = await repository.findAndCount({
      ...where,
      take: PAGINATION_NUMBER,
      skip: (page - 1) * PAGINATION_NUMBER,
    });
    return result;
  }
  async getTotalPages(totalResults: number) {
    return Math.ceil(totalResults / PAGINATION_NUMBER);
  }
}
