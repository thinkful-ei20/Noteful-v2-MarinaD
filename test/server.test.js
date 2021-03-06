'use strict';

/**
 * DISCLAIMER:
 * The examples shown below are superficial tests which only check the API responses.
 * They do not verify the responses against the data in the database. We will learn
 * how to crosscheck the API responses against the database in a later exercise.
 */
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const knex = require('../knex');
const seedData = require('../db/seedData');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});

describe('Environment', () => {

  it('NODE_ENV should be "test"', () => {
    expect(process.env.NODE_ENV).to.equal('test');
  });

  it('connection should be test database', () => {
    expect(knex.client.connectionSettings.database).to.equal('noteful-test');
  });

});

describe('Noteful App', function () {

  beforeEach(function () {
    return seedData('./db/noteful.sql', 'postgres');
  });

  after(function () {
    return knex.destroy();
  });

  describe('Static app', function () {

    it('GET request "/" should return the index page', function () {
      return chai.request(app)
        .get('/')
        .then(function (res) {
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });

  });

  describe('404 handler', function () {

    it('should respond with 404 when given a bad path', function () {
      return chai.request(app)
        .get('/bad/path')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

  });

  //DONE WITH THIS ENDPOINT!
  describe('GET /api/notes', function () {
    //DONE
    it('should return the default of 10 Notes ', function () {
      let count;
      return knex.count()
        .from('notes')
        .then(([result])=>{
          count = Number(result.count);
          return chai.request(app)
            .get('/api/notes');
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(count);
        });
    });
    //DONE
    it('should return a list with the correct right fields', function () {

      let res;

      return chai.request(app).get('/api/notes')
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return knex('notes').select();
        })
        .then(data => {
          expect(res.body).to.have.length(data.length);
          for (let i = 0; i < data.length; i ++){
            expect(res.body[i].id).to.equal(data[i].id);
            expect(res.body[i].title).to.equal(data[i].title);
          }
        });
    });
    //DONE
    it('should return correct search results for a valid query', function () {
      let res;

      return chai.request(app)
        .get('/api/notes?searchTerm=gaga')
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.be.an('object');
          return knex.select().from('notes')
            .where('title', 'like', '%gaga%');
        })
        .then(data => {
          expect(res.body[0].id).to.equal(data[0].id);
        });
    });
    //DONE
    it('should return an empty array for an incorrect query', function () {
      let res;
      return chai.request(app)
        .get('/api/notes?searchTerm=Not%20a%20Valid%20Search')
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return knex('notes').count().where('title', 'like' , '%Not a Valid Search%');
        })
        .then(([result]) => {
          let count = Number(result.count);
          expect(res.body).to.have.length(count);
        });
    });

  });

  //DONE WITH THIS ENDPOINT!
  describe('GET /api/notes/:id', function () {

    //DONE
    it('should return correct notes', function () {
      
      const dataPromise = knex.first()
        .from('notes')
        .where('id',1000);
      
      const apiPromise = chai.request(app)
        .get('/api/notes/1000');


      return Promise.all([dataPromise,apiPromise])
        .then(function ([data, res]) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content', 'folder_id','folderName', 'tags');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
        });
    });
    //DONE
    it('should respond with a 404 for an invalid id', function () {
      
      return chai.request(app)
        .get('/DOES/NOT/EXIST')
        .then(res => {
          expect(res).to.have.status(404);
          return knex('notes').select().where('id', '4738583');
        })
        .then(data => {
          expect(data.length).to.equal(0);
        });
    });

  });

  //DONE WITH THIS ENDPOINT!
  describe('POST /api/notes', function () {
    //DONE
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'tags' : [],
        'folder_id': 100
      };

      let body;

      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;

          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'title', 'content', 'folder_id', 'folderName', 'tags');

          return knex.select().from('notes').where('id', body.id);
        })
        .then( ([data]) => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
          expect(body.folder_id).to.equal(data.folder_id);
          expect(body.id).to.equal(data.id);
        });
    });
    //DONE
    it('should return an error when missing "title" field', function () {
      const newItem = {
        'foo': 'bar'
      };
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
          return knex('notes')
            .insert(newItem)
            .catch(err => {
              return err;
            });
        })
        .then((err) => {
          expect(err).to.have.property('name', 'error');
        });
    });

  });

  //DONE WITH THIS ENDPOINT
  describe('PUT /api/notes/:id', function () {
    //DONE
    it('should update the note', function () {
      const updateItem = {
        'title': 'What about dogs?!',
        'content': 'woof woof',
        'folderId' : 100,
      };

      let res;

      return chai.request(app)
        .put('/api/notes/1005')
        .send(updateItem)
        .then(function (_res) {
          res = _res;

          updateItem.folder_id = updateItem.folderId;
          delete updateItem.folderId;

          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content', 'folder_id', 'folder_name', 'tags');
          return knex('notes')
            .update(updateItem)
            .where('id', 1005)
            .returning(['id','title','content','folder_id']);
        })
        .then(([data]) => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(res.body.folder_id).to.equal(data.folder_id);
        });
    });
    //DONE
    it('should respond with a 404 for an invalid id', function () {
      const updateItem = {
        'title': 'What about dogs?!',
        'content': 'woof woof',
      };
      return chai.request(app)
        .put('/DOES/NOT/EXIST')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404);
          return knex('notes').update(updateItem).where('id', '77736271');
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });
    //DONE
    it('should return an error when missing "title" field', function () {
      const updateItem = {
        'foo': 'bar'
      };
      return chai.request(app)
        .put('/api/notes/1005')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
          return knex('notes')
            .insert(updateItem)
            .catch(err => {
              return err;
            });
        })
        .then((err) => {
          expect(err).to.have.property('name', 'error');
        });
    });

  });
  //DONE WITH THIS ENDPOINT
  describe('DELETE  /api/notes/:id', function () {
    //DONE
    it('should delete an item by id', function () {

      return chai.request(app)
        .delete('/api/notes/1005')
        .then((res) => {
          expect(res).to.have.status(204);
          return knex('notes').select()
            .where('id', 1005);
        })
        .then((result) => {
          expect(result).to.have.length(0);
        });
    });
  });



});
