import { Request, Response, NextFunction } from "express";
import { client } from "./database";
import { iMoviesResult } from "./interfaces";

const verifyCreation = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryShowMovie = `
        SELECT
            *
        FROM
            movies;
    `;
  const queryShowMovieResult: iMoviesResult = await client.query(
    queryShowMovie
  );
  const findMovie = queryShowMovieResult.rows.find((e: any) => {
    return e.name === request.body.name;
  });
  if (findMovie) {
    return response.status(409).json({ message: "Movie already exists." });
  }
  next();
};

const verifyUpdate = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryShowMovie = `
          SELECT
              *
          FROM
              movies;
      `;
  const queryShowMovieResult: iMoviesResult = await client.query(
    queryShowMovie
  );

  const findMovieByID = queryShowMovieResult.rows.find((e: any) => {
    return e.id == request.params.id;
  });

  const findMovieByName = queryShowMovieResult.rows.find((e: any) => {
    return e.name === request.body.name;
  });

  if (!findMovieByID) {
    return response.status(404).json({ message: "Movie not found." });
  }
  if (findMovieByName) {
    return response.status(409).json({ message: "Movie already exists." });
  }
  next();
};

export { verifyCreation, verifyUpdate };
