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
  const { searchTerm, folderId } = req.query;

  knex
    .select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(queryBuilder => {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
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
    .select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName')
    .leftJoin('folders','notes.folder_id', 'folders.id')
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
  const updateableFields = ['title', 'content', 'folder_id'];

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
    .returning('id')
    .then(([id]) => {

      return knex('notes')
        .select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where ({'notes.id': id});
    })
    .then(item => res.json(item[0]))
    .catch(err => next(err));
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content, folder_id} = req.body;

  const newItem = { title, content , folder_id };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;
  
  knex('notes')
    .insert(newItem)
    .returning('id')
    .then(([id])=>{
      noteId = id;
      return knex('notes')
        .select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(([result]) => {res.location(`http://${req.headers.host}/notes/${result.id}`).status(201).json(result);})
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
