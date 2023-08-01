const express = require('express');
const server = express();

require('dotenv').config();

server.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`))