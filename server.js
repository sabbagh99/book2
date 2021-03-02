const express = require('express');
const app = express();
var cors = require('cors');
require("dotenv").config();
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
var methodOverride = require('method-override');
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }});
app.use(methodOverride('_method'));
const port = process.env.PORT || 3000;


app.get('/searches/new', (req, res) => {
    res.render('pages/searches/new.ejs');
});

app.get('/', getSavedData);

app.get('/books/:id', viewDelails);

app.get('/hello', (req, res) => {
    res.send('Hello');
});
app.put('/books/:id', updateDetalis);
app.delete('/books/:id', deleteDetalis);

app.get('*', (req, res) => {
    res.status(404).render('pages/error', { error: '404 Error' });
});

app.post('/searches', (req, res) => {
    try {
        getDataFomeApi(req.body['search-que'], req.body['searching-by'], res).then(data => {
            res.render('pages/searches/show', { data: data });
        });
    } catch (e) {
        return handelError(res, e);
    }
});

app.post('/books', saveToDB);

function Book(obj) {
    this.title = obj.volumeInfo.title;
    this.author = obj.volumeInfo.authors ? obj.volumeInfo.authors.join(' & ') : 'Not Mentioned';
    this.image_url = obj.volumeInfo.imageLinks ? obj.volumeInfo.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
    this.description = obj.searchInfo.textSnippet;
}

function getDataFomeApi(q, searchingBy, res) {
    const query = {
        q: `${q}+in${searchingBy}`,
        maxResults: 10
    };
    return superagent.get('https://www.googleapis.com/books/v1/volumes', query).then(data => {
        return data.body.items.map(ele => {
            return new Book(ele);
        });
    }).catch(error => {
        return handelError(res, error);
    });
}

function getSavedData(req, res) {
    try {
        return getFormDB(null, res).then(data => {
            res.render('pages', { data: data, isVis: 'visible', isVisDis: 'hidden' });
        }).catch(e => {
            handelError(res, e);
        });
    }
    catch (e) {
        return handelError(res, e);
    }
}

function getFormDB(id, res) {
    let query = id ? `SELECT * FROM favbook WHERE id = ${id}` : 'SELECT * FROM favbook';
    return client.query(query).then(data => {
        return data.rows;
    }).catch(e => {
        return handelError(res, e);
    });
}

function viewDelails(req, res) {
    return getFormDB(req.params.id, res).then(data => {
        console.log(data);
        res.render('pages/books/show', { data: data, isVis: 'hidden', isVisDis: 'visible' });
    }).catch(e => {
        return handelError(res, e);
    });
}

function addToTable(obj,res) {
    let insertQuery = 'INSERT INTO  favbook(title,author,image_url,description)  VALUES ($1,$2,$3,$4) RETURNING id;';
    return client.query(insertQuery, [obj.title, obj.author, obj['image_url'], obj.description]).then(data => {
        return data.rows[0].id;
    }).catch(e => {
        return handelError(res, e);
    });

}
function updateDetalis(req, res) {
    let id = req.params.id;
    let info = req.body['search-que'];
    console.log(info);
    let updateQuery = 'UPDATE favbook SET title = $1, author = $2 , image_url = $3 , description = $4 WHERE id = $5';
    let safeValue = [info[0], info[1], info[2], info[3], id];
    return client.query(updateQuery, safeValue).then(() => {
        res.redirect('/');
    }).catch(e => {
        return handelError(res, e);
    });
}
function deleteDetalis(req, res) {
    let id = req.params.id;
    let deleteQuery = 'DELETE FROM favbook WHERE id=$1;';
    return client.query(deleteQuery, [id]).then(() => {
        res.redirect('/');

    }).catch(e => {
        return handelError(res, e);
    });
}
function saveToDB(req, res) {
    return addToTable(req.body).then(data => {
        res.redirect(`/books/${data}`);
    }).catch(error => {
        handelError(res, error);
    });
}
function handelError(res, error) {
    res.render('pages/error', { error: error });
}

client.connect().then(() => {
    app.listen(port, () => {
        console.log(`app listening at http://localhost:${port}`);
    });
}).catch(e => {
    console.log(e, 'errrrrroooooorrrr');
});
