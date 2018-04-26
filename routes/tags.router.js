'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex');

//GET all tags
router.get('/tags', (req,res,next)=>{
  knex('tags')
    .select()
    .then(results => res.json(results))
    .catch(err => next(err));
});

//GET by id
router.get('/tags/:id', (req,res,next)=>{
  const {id} = req.params;
  knex('tags')
    .select()
    .where('tags.id', id)
    .then(result => {
      if (result.length) res.json(result[0]);
      next();
    });
});

//POST/Create item 
router.post('/tags', (req,res,next)=>{
  const {name} = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = {name};

  knex('tags')
    .insert(newItem)
    .returning(['id','name'])
    .then(results => {
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

router.put('/tags/:id', (req, res, next)=>{
  const {id} = req.params;
  const updateableFields = ['name'];
  const updateItem = {};

  updateableFields.map(field => {
    if (field in req.body){
      updateItem[field] = req.body[field];
    }
  });

  knex('tags')
    .update(updateItem)
    .where('tags.id', id)
    .returning(['id','name'])
    .then( results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.delete('/tags/:id', (req,res,next)=>{
  const {id} = req.params;

  knex('tags')
    .where('tags.id', id)
    .del()
    .then(res.sendStatus(204))
    .catch(err => next(err));
});
module.exports = router;