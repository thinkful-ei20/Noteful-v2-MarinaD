'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex');

//GET all folders
router.get('/folders', (req, res, next)=>{
  knex
    .select('id', 'name')
    .from('folders')
    .then(results => res.json(results))
    .catch(err => next(err));
});

//GET folder by id
router.get('/folders/:id', (req, res, next)=>{
  const {id} = req.params;
  knex('folders')
    .select('id', 'name')
    .where('folders.id', id)
    .then(results => {
      if (results.length) {
        res.json(results[0]);
      }
      else next();
    })
    .catch(err => next(err));
});

// PUT folder
router.put('/folders/:id', (req, res, next)=>{
  const {id} = req.params;
  const updateObj = {};

  //validation
  if (req.body.name){
    updateObj.name = req.body.name;
  }
  else {
    const err = new Error('Missing name of folder');
    err.status = 400;
    next(err);
  }

  knex('folders')
    .update(updateObj)
    .where({'folders.id' : id})
    .returning(['id', 'name'])
    .then(results => res.json(results))
    .catch(err => next(err));
});

// POST new folder
router.post('/folders', (req, res, next)=>{
  const newObj = {};

  //validation
  if (req.body.name){
    newObj.name = req.body.name;
  }
  else {
    const err = new Error('Missing name of folder');
    err.status = 400;
    next(err);
  }
 
  knex('folders')
    .insert(newObj)
    .returning(['folders.id', 'name'])
    .then(results => {
      res.location(`http://${req.headers.host}/api/folders/${results[0].id}`)
        .status(201)
        .json(results[0]);
    })
    .catch(err => next(err));
});

//DELETE by ID
router.delete('/folders/:id', (req, res, next)=>{
  let {id} = req.params;
  knex('folders')
    .del()
    .where('folders.id', id)
    .then(res.send(204))
    .catch(err => next(err));
});

module.exports = router;