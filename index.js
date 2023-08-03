const express = require('express');
const mysql = require('mysql2');
const server = express();

require('dotenv').config();

const dbConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

dbConnection.connect(err => {
    if (err) {
        console.error('Database connection error : ', err)
        return;
    }

    console.log('Database is connected successfully')
})

server.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`))