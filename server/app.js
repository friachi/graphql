const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema')
const schemaDatamart = require('./schema/schemaDatamart')
const dbConfig = require('./database/database');
const database = require('./database/oracle');

/////// Database //////////
//need to install Oracle Instant Client (libclntsh.dylib) and add it path

const defaultThreadPoolSize = 4;
process.env.UV_THREADPOOL_SIZE = dbConfig.hrPool.poolMax + defaultThreadPoolSize; // Increase thread pool size by poolMax




/////// Web Server //////////
const app = express();


app.use('/graphql',graphqlHTTP({
    schema : schemaDatamart,
    graphiql: true
}));

app.listen(9898,()=> {
    console.log('graphql is now listening for requests on port 9898');
})


var run  = async () => {

const dbStatus = await database.startup();

/*
const result = await database.simpleExecute('select M_LABEL from ACT_BAT_DBF');

      for (var i = 0; i < result.rows.length; i++) {
        var M_LABEL = result.rows[i].M_LABEL;
        console.log(`Extractions/feeders/storedProc: ${M_LABEL}`);
      }
*/

}

run();


//handle cleaning database resources upon close of node app
process.on('SIGTERM', () => {
  console.log('Received SIGTERM');

  database.shutdown();
});

process.on('SIGINT', () => {
  console.log('Received SIGINT');

  database.shutdown();
});

process.on('uncaughtException', err => {
  console.log('Uncaught exception');
  console.error(err);

  database.shutdown(err);
});
