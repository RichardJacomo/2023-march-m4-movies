import { Request, Response } from "express";
import { client } from "./database";
import { iMovies, iMoviesResult } from "./interfaces";
import format from "pg-format";

const createMovie = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const createMovieRequest: iMovies = request.body;

  const queryCreateMovieString: string = format(
    `
      INSERT INTO
          movies(%I)
      VALUES
          (%L)
      RETURNING *;
    `,
    Object.keys(createMovieRequest),
    Object.values(createMovieRequest)
  );

  const queryCreateMoviesResult: iMoviesResult = await client.query(
    queryCreateMovieString
  );
  return response.status(201).json(queryCreateMoviesResult.rows[0]);
};

const showMovie = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const pageNumber: number = Number(request.query.page);
  const perPageNumber: number = Number(request.query.perPage);

  let page;
  let perPage;
  if (typeof pageNumber === "number" && pageNumber >= 1) {
    page = pageNumber;
  }
  if (
    typeof perPageNumber === "number" &&
    perPageNumber >= 1 &&
    perPageNumber <= 5
  ) {
    perPage = perPageNumber;
  }
  if (page === undefined) {
    page = 1;
  }
  if (perPage === undefined) {
    perPage = 5;
  }
  page = (page - 1) * perPage;

  const queryShowMovie = `
        SELECT
            *
        FROM
            movies
        LIMIT $1 OFFSET $2;    
    `;
  const queryShowMovieConfig = {
    text: queryShowMovie,
    values: [perPage, page],
  };

  const queryShowMovieResult: iMoviesResult = await client.query(
    queryShowMovieConfig
  );

  const queryShowMovieTotal = `
  SELECT
      *
  FROM
      movies   
`;
  const queryShowMovieTotalResult: iMoviesResult = await client.query(
    queryShowMovieTotal
  );

  let previousPage;
  let nextPage;
  let data = queryShowMovieResult.rows;
  let count = queryShowMovieResult.rowCount;

  if (page === 0 || page === 1) {
    ("");
    previousPage = null;
  } else if (page >= 2) {
    previousPage = `http://localhost:3000/movies?page=${
      Number(request.query.page) - 1
    }&perPage=${perPage}`;
  }

  let numPagesTotal = queryShowMovieTotalResult.rows.length / perPage;

  if (Number(request.query.page) > numPagesTotal) {
    nextPage = null;
  } else if (Number(request.query.page) === numPagesTotal) {
    nextPage = null;
  } else if (Number(request.query.page) < numPagesTotal) {
    nextPage = `http://localhost:3000/movies?page=${
      Number(request.query.page) + 1
    }&perPage=${perPage}`;
  }

  nextPage =
    page === 0
      ? `http://localhost:3000/movies?page=2&perPage=${perPage}`
      : nextPage;

  const showMoviesObjectResult = {
    previousPage: previousPage || null,
    nextPage: nextPage || null,
    count: count,
    data: data,
  };

  let sort = request.query.sort || null;
  let order = request.query.order || "ASC";
  if (
    (sort === "price" || sort === "duration") &&
    (order === "ASC" || order === "DESC")
  ) {
    const showMoviesBySortAndOrder: string = format(
      `SELECT * FROM movies ORDER BY %I ${order}`,
      sort
    );

    const filterMoviesResult = await client.query(showMoviesBySortAndOrder);
    return response.status(200).json(filterMoviesResult.rows);
  }

  return response.status(200).json(showMoviesObjectResult);
};

async function findMovieByID(
  id: string,
  request: Request,
  response: Response
): Promise<Response | number> {
  let found = 0;
  const querySearchMovie = `
    SELECT
        *
    FROM
        movies;
  `;

  const querySearchMovieResult: iMoviesResult = await client.query(
    querySearchMovie
  );
  const findMovie = querySearchMovieResult.rows.find((e: any) => {
    return e.id == request.params.id;
  });

  if (!findMovie) {
    return response.status(404).json({ message: "Movie not found" });
  }
  return (found = 200);
}

const updateMovie = async (request: Request, response: Response) => {
  const verifyFindMovieByID = await findMovieByID(
    request.params.id,
    request,
    response
  );

  const id = request.params.id;
  const queryUpdateMovie = `
      UPDATE movies
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        duration = COALESCE($3, duration),
        price = COALESCE($4, price)
      WHERE id = $5;
      `;
  const values = [];
  values.push(request.body.name || null);
  values.push(request.body.description || null);
  values.push(request.body.duration ? Number(request.body.duration) : null);
  values.push(request.body.price ? Number(request.body.price) : null);
  values.push(id);

  await client.query(queryUpdateMovie, values);

  const queryShowMovie = `
          SELECT
              *
          FROM
              movies;
      `;
  const queryShowMovieResult: iMoviesResult = await client.query(
    queryShowMovie
  );

  const value = queryShowMovieResult.rows.find((e: any) => {
    return e.id == request.params.id;
  });

  if (verifyFindMovieByID === 200) {
    return response.status(200).json(value);
  }
};

const deleteMovie = async (request: Request, response: Response) => {
  const verifyFindMovieByID = await findMovieByID(
    request.params.id,
    request,
    response
  );
  if (verifyFindMovieByID === 200) {
    const id = request.params.id;
    const queryDeleteMovie = `
                  DELETE FROM movies WHERE id = $1
              `;
    const value = [];
    value.push(id);
    await client.query(queryDeleteMovie, value);
    return response.status(204).json();
  }
};

export { showMovie, updateMovie, deleteMovie, createMovie };
