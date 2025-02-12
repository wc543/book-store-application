INSERT INTO users (username, password) VALUES
    ('johndoe', '$argon2id$v=19$m=65536,t=3,p=4$+cNMps0r0A2BxUxBVTPA4g$z8x343rzfkx1NuQ0asG4deUO1MKLvZaiOKXCnU6jmJw'),
    ('janedoe', '$argon2id$v=19$m=65536,t=3,p=4$+cNMps0r0A2BxUxBVTPA4g$z8x343rzfkx1NuQ0asG4deUO1MKLvZaiOKXCnU6jmJw'),
    ('bobsmith', '$argon2id$v=19$m=65536,t=3,p=4$+cNMps0r0A2BxUxBVTPA4g$z8x343rzfkx1NuQ0asG4deUO1MKLvZaiOKXCnU6jmJw');
--All 3 passwords are "password"
--argon2.hash("password").then(h => { console.log(h) });

INSERT INTO authors (id, name, bio) VALUES
    (1, 'John Doe', 'Author of various fiction novels'),
    (2, 'Jane Doe', 'Author of detective novels'),
    (3, 'Bob Smith', 'Author of historical fiction');

INSERT INTO books (author_id, title, pub_year, genre) VALUES
    (1, 'Fictional World', '2020', 'Fiction'),
    (1, 'The Last Adventure', '2021', 'Adventure'),
    (2, 'Mystery Night', '2019', 'Mystery'),
    (2, 'The Silent Witness', '2020', 'Detective'),
    (3, 'Past Glories', '2018', 'Historical Fiction'),
    (3, 'Echoes of the Past', '2022', 'Historical Fiction');
