DROP TABLE IF EXISTS favbook;

CREATE TABLE favbook (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    image_url VARCHAR(255),
    description VARCHAR(500)
  );

INSERT INTO  favbook(title,author,image_url,description) VALUES ('Ahmad', 'Ahmad', 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg','Ahmad');
INSERT INTO  favbook(title,author,image_url,description) VALUES ('Areej', 'Areej', 'https://images.ctfassets.net/hrltx12pl8hq/4plHDVeTkWuFMihxQnzBSb/aea2f06d675c3d710d095306e377382f/shutterstock_554314555_copy.jpg','Areej');
