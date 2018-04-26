'use strict';

const express = require('express');
const knex = require('../knex');

// Create an router instance (aka "mini-app")
const router = express.Router();

const hydrate = require('../utils/hydrateNotes');
// TEMP: Simple In-Memory Database
// const data = require('../db/notes');
// const simDB = require('../db/simDB');
// const notes = simDB.initialize(data);

// Get All (and search by query)
router.get('/notes', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;

  knex
    .select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName', 'tags.name as tagName', 'tags.id as tagId')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags','notes.id', 'notes_tags.notes_id')
    .leftJoin('tags', 'tags.id', 'notes_tags.tags_id')
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
    .modify(queryBuilder =>{
      if(tagId) {
        queryBuilder.where('tags.id', tagId);
      }
    })
    .orderBy('notes.id')
    .then(list => {
      if(list) {
        const result = hydrate(list);
        res.json(result);
      }
      else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// Get a single item
router.get('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  knex('notes')
    .select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
    .leftJoin('folders','notes.folder_id', 'folders.id')
    .leftJoin('notes_tags','notes.id','notes_tags.notes_id')
    .leftJoin('tags', 'notes_tags.tags_id','tags.id')
    .where('notes.id', id)
    .then(item => {
      if(item.length === 0){
        res.status(404);
        next();
      }

      const result = hydrate(item);
      res.json(result[0]);})
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
    .update(updateObj) // UPDATE notes SET updateObj WHERE notes.id = id RETURNING id <-- id of the record that was updated
    .where('notes.id',id) //returning avoids having to make an additional SELECT query
    .returning('id')
    .then(([id]) => {

      return knex('notes')
        .select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name') //SELECT
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where ({'notes.id': id});
    })
    .then(item => res.json(item[0]))
    .catch(err => next(err));
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content, folder_id, tags} = req.body;

  const newItem = { title, content , folder_id};
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
    .then(([id])=> {
      noteId = id;
      const tagsToInsert = tags.map(tagId => {
        return {
          notes_id : noteId,
          tags_id : tagId
        };
      });
      return knex('notes_tags')
        .insert(tagsToInsert);
    })
    .then(()=>{

      return knex('notes')
        .select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes_tags.notes_id', 'notes.id')
        .leftJoin('tags','notes_tags.tags_id','tags.id')
        .where('notes.id', noteId);
    })
    .then((results) => {
      if(results) {
        const result = hydrate(results);
        res.location(`http://${req.headers.host}/notes/${result.id}`).status(201).json(result);
      }
      else {
        next();
      }
    })
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
