const express = require('express')
const bodyParser = require('body-parser')
const knex = require('./db/knex')
const multer = require('multer')
const multerS3 = require('multer-s3')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')

require('dotenv').config()

process.env.AWS_ACCESS_KEY_ID = process.env.BUCKETEER_AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY;
process.env.AWS_REGION = 'us-east-1';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.BUCKETEER_BUCKET_NAME,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, `${req.params.id}-profile-img`)
        }
    })
})

const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static('public'))

app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET, 
  cookie: { maxAge: 60000 },
  resave: false,    // forces the session to be saved back to the store
  saveUninitialized: false  // dont save unmodified
}));
app.use(flash());

app.get('/admin/users/:id', (req, res) => {
    if (!req.params.id) return res.sendStatus(422)
    knex('users')
        .where('id', req.params.id)
        .then(user => {
            res.render('pages/user', { user: user[0], message: req.flash('message')[0] })
        })
})

app.get('/admin/users/:id/edit', (req, res) => {
    if (!req.params.id) return res.sendStatus(422)
    knex('users')
        .where('id', req.params.id)
        .then(user => {
            res.render('pages/edituser', { user: user[0], message: req.flash('message')[0] })
        })
})

app.post('/api/admin/users/:id/image', upload.single('user_image'), (req, res) => { // should and can validate file extension (png || jpg) and size (probably shouldn't be bigger than 1MB)
    if (!req.params.id || !req.file) return res.sendStatus(422)
    knex('users')
        .where('id', req.params.id)
        .update({
            imgUrl: req.file.location
        })
        .then(() => {
            req.flash('message', 'User image updated!')
            res.redirect("/admin/users/" + req.params.id)
        })
        .catch(e => {
            console.error(e)
            res.sendStatus(500)
        })
})

app.post('/api/admin/users/:id', (req, res) => { // should validate post body here using express-validator
    if (!req.params.id) return res.sendStatus(422)

    for (let key in req.body) {
        if (req.body[key] === '') {
            req.flash('message', `fields cannot be empty`)
            return res.redirect(`/admin/users/${req.params.id}/edit`)
        }
    }

    const updatedBody = {
        ...req.body,
        admin: req.body.admin === 'true' ? true : false,
        displayRealName: req.body.displayRealName === 'true' ? true : false
    }
    knex('users')
        .where('id', req.params.id)
        .update(updatedBody)
        .then(() => {
            req.flash('message', 'User updated!')
            res.redirect('/admin/users/' + req.params.id)
        })
        .catch(e => { // should also flash for these cases and redirect to the proper page
            console.error(e)
            res.sendStatus(500)
        })
})

app.post('/api/admin/users', (req, res) => { // should validate post body here using express-validator
    const updatedBody = {
        ...req.body,
        admin: req.body.admin === 'true' ? true : false,
        displayRealName: req.body.displayRealName === 'true' ? true : false
    }
    knex('users')
        .insert(updatedBody)
        .returning('id')
        .then(ids => {
            req.flash('message', 'User created!')
            res.redirect('/admin/users/' + ids[0])
        })
})

app.get('/', (req, res) => {
    res.render('pages/index')
})

app.get('/about', (req, res) => {
    res.render('pages/about')
})


app.get('/admin/users', (req, res) => {
    knex('users')
        .then(users => {
            res.render('pages/users', { users })
        })

})

app.get('/admin/users/new', (req, res) => {
    res.render('pages/newuser', {
        user: {
            firstName: '',
            lastName: '',
            handle: '',
            displayRealName: '',
            bio: '',
            imgUrl: '',
            admin: '',
        }
    })
})

app.listen(process.env.PORT || 3000)