CREATE TABLE filmovi (
    nazivFilma TEXT NOT NULL,
    redatelj TEXT NOT NULL,
    slikaUrl TEXT NOT NULL,
	id SERIAL NOT NULL PRIMARY KEY
);

INSERT INTO filmovi VALUES ('Spider-Man', 'Sam Raimi', 'https://upload.wikimedia.org/wikipedia/en/6/6c/Spider-Man_%282002_film%29_poster.jpg?20171215231428');
INSERT INTO filmovi VALUES ('Spider-Man 2', 'Sam Raimi', 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Spider-Man_2_poster.jpg/220px-Spider-Man_2_poster.jpg');
INSERT INTO filmovi VALUES ('Spider-Man 3', 'Sam Raimi', 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Spider-Man_3%2C_International_Poster.jpg/220px-Spider-Man_3%2C_International_Poster.jpg');

INSERT INTO filmovi VALUES ('Batman Begins', 'Christopher Nolan', 'https://upload.wikimedia.org/wikipedia/en/thumb/a/af/Batman_Begins_Poster.jpg/220px-Batman_Begins_Poster.jpg');
INSERT INTO filmovi VALUES ('The Dark Knight', 'Christopher Nolan', 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg');
INSERT INTO filmovi VALUES ('The Dark Knight Rises', 'Christopher Nolan', 'https://upload.wikimedia.org/wikipedia/en/8/83/Dark_knight_rises_poster.jpg');