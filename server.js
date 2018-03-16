'use strict';

// Use this to use .env File
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const multer = require('multer');
const axios = require('axios');

const {PORT, CLIENT_ORIGIN} = require('./config');
const {dbConnect} = require('./db-mongoose');
const jwtStrategy = require('./passport/jwt');
const localStrategy = require('./passport/local');

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const picRouter = require('./routes/pics');

// Init app
const app = express();

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename(req, file, cb) {
    cb(null, `${new Date()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Public Folder
app.use(express.static('./public'));

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(express.json());

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.post('/api/uploads', upload.single('file'), (req, res) => {
  const file = req.file; // file passed from client
  const meta = req.body; // all other values passed from the client, like name, etc..
  console.log(file);
  // send the data to our REST API
  // axios({
  //   url: '',
  //   method: 'post',
  //   data: {
  //     file,
  //     name: meta.name,      
  //   },
  // })
  //   .then(response => res.status(200).json(response.data.data))
  //   .catch((error) => res.status(500).json(error.response.data));
});

app.use('/api', usersRouter);
app.use('/api', authRouter);

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(passport.authenticate('jwt',
  {session: false, failWithError: true})
);

app.use('/api', picRouter);

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = {app};