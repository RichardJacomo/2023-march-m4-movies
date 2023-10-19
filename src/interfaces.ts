import { QueryResult } from "pg";

interface iMovies {
  name: string;
  description: string | undefined;
  duration: number;
  price: number;
}

type iMoviesResult = QueryResult<iMovies>;

export { iMovies, iMoviesResult };
