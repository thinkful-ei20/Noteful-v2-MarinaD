'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
// const data = require('../db/notes');
// const simDB = require('../db/simDB');
// const notes = simDB.initialize(data);

// Get All (and search by query)
router.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;

  knex
    .select('notes.id', 'title', 'content')
    .from('notes')
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .orderBy('notes.id')
    .then(list => {
      res.json(list);
    })
    .catch(err => {
      next(err);
    });
});

// Get a single item
router.get('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  knex('notes')
    .select('notes.id','title','content')
    .where('notes.id', id)
    .then(item=> {
      if(item.length === 0){
        res.status(404);
        next();
      }
      res.json(item[0]);})
    .catch(err => next(err));
});

// Put update an item
router.put('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .update(updateObj)
    .where('notes.id',id)
    .returning(['notes.id','title','content'])
    .then(item => res.json(item[0]))
    .catch(err => next(err));
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  
  knex('notes')
    .insert(newItem)
    .returning(['notes.id','title','content'])
    .then(item => {res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item[0]);})
    .catch(err=> next(err));
});

// Delete an item
router.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
    .del()
    .where('notes.id',id)
    .then(res.sendStatus(204))
    .catch (err=> next(err));
});

module.exports = router;
