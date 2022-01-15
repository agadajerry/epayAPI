
import {Request, Response} from 'express'




export const myPagination = (
  page: any,
  limit: any,
  collectionName: any,
  returnCollectionVal: any
) => {
  return async (req: Request, res: Response) => {
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;

    // Pagination
    const startPage = (page - 1) * limit;
    const endPage = page * limit;
    const totalDocs = await collectionName.countDocuments(); // this counts all the documents in the collection. Similar to .length
    let pagination = {};

    // adding next and previous pages in the api
    //next page
    if (endPage < totalDocs) {
      pagination = {
        next: page + 1,
        limit: limit,
      };
    }

    // previous page
    if (startPage > 0) {
      pagination = {
        previous: page - 1,
        limit: limit,
      };
    }

    const answer = await returnCollectionVal.skip(startPage).limit(limit);
    //now we have our paginated results
    res
      .status(200)
      .json({ success: true, count: answer.length, pagination, data: answer });
  };
};


export default myPagination