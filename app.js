const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { sequelize, User, Event, Registration } = require('./models/db');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
  session({
    secret: 'campus_event_secret_key',
    resave: false,
    saveUninitialized: false
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get('/', async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{ model: User, as: 'Organizer' }],
      order: [['id', 'DESC']]
    });
    res.render('dashboard', { events });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/login', (req, res) => res.render('login', { error: null }));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = user.toJSON();
    return res.redirect('/');
  }

  res.render('login', { error: 'Invalid email or password' });
});

app.get('/register', (req, res) => res.render('register', { error: null }));

app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    await User.create({ name, email, password: hashedPassword, role: role || 'student' });
    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Email already exists or invalid data.' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.post('/events/create', async (req, res) => {
  if (!req.session.user || req.session.user.role === 'student') {
    return res.status(403).send('Unauthorized');
  }

  const { title, description, date, venue, limit } = req.body;
  await Event.create({
    title,
    description,
    date,
    venue,
    limit,
    organizerId: req.session.user.id
  });

  res.redirect('/');
});

app.post('/events/:id/register', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  try {
    await Registration.create({
      userId: req.session.user.id,
      eventId: req.params.id
    });
  } catch (e) {
    // Already registered or other validation error
  }

  res.redirect('/');
});

app.post('/events/:id/delete', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const event = await Event.findByPk(req.params.id);
  if (event && (req.session.user.role === 'admin' || event.organizerId === req.session.user.id)) {
    await event.destroy();
  }

  res.redirect('/');
});

sequelize.sync().then(() => {
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
});
