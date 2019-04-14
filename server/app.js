const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema')
const dbConfig = require('./database/database');
const database = require('./database/oracle');

/////// Database //////////
//need to install Oracle Instant Client (libclntsh.dylib) and add it path

const defaultThreadPoolSize = 4;
process.env.UV_THREADPOOL_SIZE = dbConfig.hrPool.poolMax + defaultThreadPoolSize; // Increase thread pool size by poolMax

async function startup() {

  try {
    console.log('Initializing database module');

    await database.initialize();
  } catch (err) {
    console.error(err);

    process.exit(1); // Non-zero failure code
  }

}

startup();

async function shutdown(e) {
  let err = e;

  console.log('Shutting down application');

  try {
    console.log('Closing database module');

    await database.close();
  } catch (e) {
    console.error(e);

    err = err || e;
  }

  console.log('Exiting process');

  if (err) {
    process.exit(1); // Non-zero failure code
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => {
  console.log('Received SIGTERM');

  shutdown();
});

process.on('SIGINT', () => {
  console.log('Received SIGINT');

  shutdown();
});

process.on('uncaughtException', err => {
  console.log('Uncaught exception');
  console.error(err);

  shutdown(err);
});


/////// Web Server //////////
const app = express();


app.use('/graphql',graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(4000,()=> {
    console.log('graphql is now listening for requests on port 4000');
})


// Test Database
async function getUser(){
const result = await database.simpleExecute('select user, systimestamp from dual');
      const user = result.rows[0].USER;
      const date = result.rows[0].SYSTIMESTAMP;

      console.log(`DB user: ${user}\nDate: ${date}`);
}

getUser();