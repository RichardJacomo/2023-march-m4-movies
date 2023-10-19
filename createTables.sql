-- cria banco de dados
CREATE DATABASE entrega_s2_m4;

-- cria tabela
CREATE TABLE IF NOT EXISTS movies (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) UNIQUE NOT NULL,
	description TEXT,
	duration INTEGER NOT NULL,
	price INTEGER NOT NULL
);

-- seleciona todos os filmes
 SELECT
            *
        FROM
            movies;

-- insere valores para as colunas
  INSERT INTO
        movies(name, description, duration, price)
    VALUES
    	('Rambo II', 'Filme de ação', 120, 70);

-- deleta valores de uma coluna que atenda a uma condição
 DELETE FROM movies WHERE id = 1;   

--  atualiza valores de uma coluna que atenda a uma condição
UPDATE movies
SET
  (name, description, duration, price) = ROW('Rocky', 'Melhor filme de luta', 130, 90)
WHERE id = 1;

-- ordena lista de acordo com price
SELECT * FROM movies ORDER BY price ASC;