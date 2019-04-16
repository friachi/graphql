const oracledb = require('oracledb');
const dbConfig = require('./database');

async function initialize() {

  await oracledb.createPool(dbConfig.hrPool);
  console.log("pool created");
}

module.exports.initialize = initialize;

async function close() {
  await oracledb.getPool().close();
  console.log("pool closed");
}

module.exports.close = close;

function simpleExecute(statement, binds = [], opts = {}) {
  return new Promise(async (resolve, reject) => {
    let conn;

    opts.outFormat = oracledb.OBJECT;
    opts.autoCommit = true;

    try {
    console.log("Requesting connection");
      conn = await oracledb.getConnection();

      const result = await conn.execute(statement, binds, opts);

      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      if (conn) { // conn assignment worked, need to close
        try {
          await conn.close();
        } catch (err) {
          console.log(err);
        }
      }
    }
  });
}

module.exports.simpleExecute = simpleExecute;

async function startup() {

  try {
    console.log('Initializing database module');

    await initialize();
  } catch (err) {
    console.error(err);

    process.exit(1); // Non-zero failure code
  }

}

module.exports.startup = startup;

async function shutdown(e) {
  let err = e;

  console.log('Shutting down application');

  try {
    console.log('Closing database module');

    await close();
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

module.exports.shutdown = shutdown;
