const express = require('express');
const sequelize = require('./dbConfig');

require('./entities/User');

const server = express();

sequelize.sync({ alter: true }).then(() => {
    console.log('Database is connected successfully')
}).catch(err => {
    console.error('Database connection error : ', err)
});


server.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`))