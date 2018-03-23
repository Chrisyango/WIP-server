'use strict';

const {app} = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

const mongoose = require('mongoose');
const {TEST_DATABASE_URL} = require('../config');
const User = require('../models/user');

describe('User endpoints', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';
  const email = 'example@example.com';
  const usernameB = 'exampleUserB';
  const passwordB = 'examplePassB';
  const fullnameB = 'Example UserB';


  before(function () {
    return mongoose.connect(TEST_DATABASE_URL, {autoIndex: false});
  });
  
  beforeEach(function() {
    return User.hashPassword(password)
      .then(password => {
        User.create({
          username,
          password,
          fullname,
          email
        });
      });
  });
  
  afterEach(function() {
    return User.remove({});
  });
  
  after(function() {
    return mongoose.disconnect();
  });

  describe('POST /api/users', function() {
    it('Should reject users with missing username', function() {
      return chai.request(app)
        .post('/api/users')
        .send({
          password,
          fullname,
          email
        })
        .then(() => {
          expect.fail(null, null, 'Request should not succeed');
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('hasFields');
        });
    });
    it('Should reject users with missing password', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          fullname,
          email
        })
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('hasFields');
        });
    });

    it('Should reject users when a field is not a string', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          fullname,
          email,
          password: []
        })
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Incorrect field type: expected string');
          expect(res.body.location).to.equal('stringField');
        });
    });

    it('Should reject users when a field starts or ends with a space', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          fullname,
          email,
          password: 'hello123 '
        })
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Field cannot start or end with whitespace');
          expect(res.body.location).to.equal('trimmedField');
        });
    });

    it('Should reject users when password length is lower than 8', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          fullname,
          email,
          password: 'hello12'
        })
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Username needs to be at least 1 character long and Password needs to be at least 8 characters long');
          expect(res.body.location).to.equal('tooSmallField');
        });
    });

    it('Should reject users when username already exists', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          fullname,
          email,
          password
        })
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          
          const res = err.response;
          expect(res).to.have.status(500);
        });
    });
  });
});