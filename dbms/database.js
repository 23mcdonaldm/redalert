const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: '4thekids',
    database: 'redalert'
})

module.exports = pool;

/*
client.connect();

client.query(`SELECT * FROM person`, (err, res) => {
    if(!err) {
        console.log(res.rows);
    } else {
        console.log(err);
    }
    client.end;
})
*/