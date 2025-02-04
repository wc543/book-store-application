INSERT INTO authors (id, name, bio) VALUES
    (1, 'J.K. Rowling', 'Author of Harry Potter'),
    (2, 'George Orwell', 'Author of 1984 and Animal Farm'),
    (3, 'J.R.R. Tolkien', 'Author of The Lord of the Rings and The Hobbit');

INSERT INTO books (id, author_id, title, pub_year, genre) VALUES
    (1, 1, 'Harry Potter and the Philosopher''s Stone', '1997', 'Fantasy'),
    (2, 1, 'Harry Potter and the Chamber of Secrets', '1998', 'Fantasy'),
    (3, 2, '1984', '1949', 'Dystopian'),
    (4, 2, 'Animal Farm', '1945', 'Political Satire'),
    (5, 3, 'The Hobbit', '1937', 'Fantasy'),
    (6, 3, 'The Fellowship of the Ring', '1954', 'Fantasy');