'use strict';

const knex = require('../knex');

//Get all notes
// let searchTerm = 'golden';
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .orderBy('notes.id')
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });

// ** Get note by id
// let id = 1003;
// knex('notes')
//   .select('notes.id','title','content')
//   .where('notes.id', id)
//   .then(results=> console.log(results[0]))
//   .catch(err => console.log(err));

//**Update note by ID
// let id = 1003;
// let updateObj = {title : 'Brand new new new knexy title'};
// knex('notes')
//   .update(updateObj)
//   .where('notes.id',id)
//   .returning(['notes.id','title','content'])
//   .then(results => console.log(results[0]))
//   .catch(err => console.log(err));

// let newObj = {
//   title : 'my sweet title',
//   content: 'my sweet content'
// };
// knex('notes')
//   .insert(newObj)
//   .returning(['notes.id','title','content'])
//   .then(results => console.log(results[0]))
//   .catch(err=> console.log(err));

// let id = 1003;
// knex('notes')
//   .del()
//   .where('notes.id',id)
//   .then(console.log('success!'))
//   .catch (err=> console.log(err));


// knex.select('id', 'name')
//   .from('folders')
//   .then(results => console.log(results))
//   .catch(err => console.log (err));
  
// let id = 100;
// knex('folders')
//   .select('id', 'name')
//   .where('folders.id', id)
//   .then(results => console.log(results))
//   .catch(err => console.log (err));


// let newObj = {name : 'THIS IS NEW!'};

// knex('folders')
//   .insert(newObj)
//   .returning(['folders.id', 'name'])
//   .then( results => console.log(results))
//   .catch(err => console.log(err));


// knex('folders')
//   .update(updateObj)
//   .where('folders.id', id)
//   .returning(['id', 'name'])
//   .then(results => console.log(results))
//   .catch(err => console.log (err));

// knex('tags')
//   .select()
// //   .then(results => console.log(results));

// let updateObj = {tags_id : 2};
// knex('notes_tags')
//   .del()
//   .where('notes_id', 1001)
//   .then(

//   )

//   .then(results => console.log(results));