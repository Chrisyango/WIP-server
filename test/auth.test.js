'use strict';

const {app} = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

const mongoose = require('mongoose');
const {TEST_DATABASE_URL, JWT_SECRET} = require('../config');
const User = require('../models/user');

describe('Auth endpoints', function() {
  const fullname = 'Example User';
  const username = 'exampleUser';
  const password = 'examplePass';
  const email = 'example@example.com';
  
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
  
  describe('POST api/login', function() {
    it('Should reject requests with no credentials', function() {
      return chai.request(app)
        .post('/api/login')
        .then(() => {
          expect.fail(null, null, 'Request should not succeed');
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
  
          const res = err.response;
          expect(res).to.have.status(400);
        });
    });
    it('Should reject incorrect usernames', function() {
      return chai.request(app)
        .post('/api/login')
        .send({username: 'wrongUsername', password})
        .then(() => {
          expect.fail(null, null, 'Request should not succeed');
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
  
          const res = err.response;
          expect(res).to.have.status(500);
        });
    });
    it('Should reject incorrect passwords', function() {
      return chai.request(app)
        .post('/api/login')
        .send({username, password: 'wrongPassword'})
        .then(() => {
          expect.fail(null, null, 'Request should not succeed');
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
  
          const res = err.response;
          expect(res).to.have.status(500);
        });
    });
    it('Should return a valid auth token', function() {
      return chai.request(app)
        .post('/api/login')
        .send({username, password})
        .then(res => {
          console.log(res.users);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {algorithms: ['HS256']});
          expect(payload.user.username).to.equal(username);
          expect(payload.user.fullname).to.equal(fullname);
        });
    });
  });
  
  describe('POST /api/refresh', function() {
    it('Should reject requests with no credentials', function() {
      return chai.request(app)
        .post('/api/refresh')
        .then(() => {
          expect.fail(null, null, 'Request should not succeed');
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
  
          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an invalid token', function() {
      const token = jwt.sign(
        {
          username,
          fullname
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );
  
      return chai.request(app)
        .post('/api/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(() => {
          expect.fail(null, null, 'Request should not succeed');
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
  
          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an expired token', function() {
      const token = jwt.sign(
        {
          user: {
            username,
            fullname
          },
          exp: Math.floor(Date.now() / 1000) -10
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username
        }
      );
  
      return chai.request(app)
        .post('/api/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(() => {
          expect.fail(null, null, 'Request should not succeed');
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
  
          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should return a valid auth token with a newer expiry date', function() {
      const token = jwt.sign({
        user: {
          username,
          fullname
        }
      },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        subject: username,
        expiresIn: '7d'
      });
  
      return chai.request(app)
        .post('/api/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {algorithm: ['HS256']});
          expect(payload.user.username).to.equal(username);
          expect(payload.user.fullname).to.equal(fullname);
        });
    });
  });
});