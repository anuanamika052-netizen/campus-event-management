const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');
const { sequelize, User, Event, Registration } = require('./models/db');

const app = express();

const DEMO_EVENTS = [
  {
    title: 'TechFest 2026',
    category: 'Technical',
    date: '2026-11-05',
    description: 'An engineering college technology festival with project showcases, technical challenges, and student demonstrations.',
    venue: 'Engineering Block',
    limit: 250
  },
  {
    title: 'CodeSprint',
    category: 'Technical',
    date: '2026-11-12',
    description: 'A team-based coding competition where students design and build innovative software solutions.',
    venue: 'Computer Science Lab',
    limit: 100
  },
  {
    title: 'Rhythm Night',
    category: 'Cultural',
    date: '2026-11-19',
    description: 'An evening of student music and dance performances celebrating campus creativity and talent.',
    venue: 'Main Auditorium',
    limit: 300
  },
  {
    title: 'Sports Carnival',
    category: 'Sports',
    date: '2026-11-26',
    description: 'An interdepartmental sports meet featuring athletics and indoor and outdoor games.',
    venue: 'College Sports Ground',
    limit: 300
  },
  {
    title: 'Creative Canvas',
    category: 'Cultural',
    date: '2026-12-03',
    description: 'A student art showcase and creative workshop featuring illustration, design, and collaborative projects.',
    venue: 'Central Exhibition Hall',
    limit: 120
  },
  {
    title: 'InnovateX',
    category: 'Workshop',
    date: '2026-12-10',
    description: 'An innovation showcase where engineering students present prototypes and explore emerging technologies.',
    venue: 'Innovation Lab',
    limit: 150
  }
];

async function seedDemoEvents() {
  const tableName = Event.getTableName();
  const columns = await sequelize.getQueryInterface().describeTable(tableName);

  if (!columns.category) {
    await sequelize.getQueryInterface().addColumn(tableName, 'category', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'General'
    });
  }

  const existingEvent = await Event.findOne();
  const organizer = (existingEvent && await User.findByPk(existingEvent.organizerId)) ||
    (await User.findOne({ where: { role: 'admin' } })) ||
    (await User.findOne({ where: { role: 'organizer' } }));

  if (!organizer) {
    throw new Error('Cannot add sample events because no event organizer account exists.');
  }

  for (const event of DEMO_EVENTS) {
    await Event.findOrCreate({
      where: { title: event.title },
      defaults: { ...event, organizerId: organizer.id }
    });
  }
}

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

  const { title, description, date, venue, limit, category } = req.body;
  await Event.create({
    title,
    description,
    date,
    venue,
    limit,
    category: category || 'General',
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

sequelize.sync()
  .then(seedDemoEvents)
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('Unable to initialize the campus event database:', err);
    process.exitCode = 1;
  });
