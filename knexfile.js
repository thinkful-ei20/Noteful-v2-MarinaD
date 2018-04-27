'use strict';

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://dev:dogstitch@localhost/noteful-app',
    debug: false, // http://knexjs.org/#Installation-debug
    pool: { min: 1, max: 2 }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  },
  test : {
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL || 'postgres://dev@localhost/noteful-test',
    pool: {min:1, max:2}
  }
};
