import type { Query } from 'mongoose';

type QueryString = Record<string, any> & {
  page?: any;
  sort?: any;
  limit?: any;
  fields?: any;
};

class APIFeatures<T> {
  query: Query<T[], T>;
  queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj: Record<string, any> = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const parsed = JSON.parse(queryStr);

    const deepConvertNumbers = (obj: any): any => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          obj[key] = deepConvertNumbers(obj[key]);
        } else if (!isNaN(obj[key])) {
          obj[key] = parseFloat(obj[key]);
        }
      }
      return obj;
    };

    this.query = this.query.find(deepConvertNumbers(parsed)) as any;
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = String(this.queryString.sort).split(',').join(' ');
      this.query = this.query.sort(sortBy) as any;
    } else {
      this.query = this.query.sort('-createdAt') as any;
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = String(this.queryString.fields).split(',').join(' ');
      this.query = (this.query as any).select(fields);
    } else {
      this.query = (this.query as any).select('-__v');
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = (this.query as any).skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
