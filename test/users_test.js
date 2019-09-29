var chai = require('chai');
var chaiHttp = require( 'chai-http');
var app = require('../index');
// Configure chai
chai.use(chaiHttp);
chai.should();

describe("fetch users from api", () => {
    describe('/api/users', () => {
        // Test to get all users from database through api
        it("should give all users", (done) => {
            chai.request(app)
                .get('/api/users')
                .end((err,res) => {
                    if(err)
                      done(err);
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
    describe('/api/users', () => {
        it("should create a new user",(done) => {
            chai.request(app)
                .post('/api/users')
                .send({username: 'username', role: 'user', email: 'email', password: 'password'})
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err,res) => {
                    if(err)
                        done(err);
                    res.body.should.have.property('newUser');
                    res.body.newUser.should.have.property('username','username');
                    res.body.newUser.should.have.property('role','user');
                    res.body.newUser.should.have.property('email','email');
                    res.body.newUser.should.have.property('password','password');
                });
        });
    });
});

