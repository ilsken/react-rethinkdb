import Promise from 'bluebird';
import r from 'rethinkdb';
import cfg from './config';

const connPromise = Promise.promisify(r.connect)({
  host: cfg.dbHost,
  port: cfg.dbPort,
  db: cfg.dbName,
});
const run = q => connPromise.then(c => q.run(c));

console.log('Resetting chess db...');

const recreateDb = name => run(r.dbDrop(name))
                           .catch(() => {})
                           .then(() => run(r.dbCreate(name)));

const recreateTable = name => run(r.tableDrop(name))
                              .catch(() => {})
                              .then(() => run(r.tableCreate(name)));

recreateDb(cfg.dbName).then(() => (
  Promise.all([
    recreateTable('games'),
    recreateTable('moves'),
  ])
)).then(() => {
  connPromise.then(c => c.close());
  console.log('Completed');
});
