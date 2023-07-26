const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const xml2js = require('xml2js');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Create SQLite3 database
const db = new sqlite3.Database('contacts.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create contact_us table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS contact_us (
        id INTEGER PRIMARY KEY,
        name TEXT,
        subject TEXT,
        email TEXT,
        phone TEXT,
        message TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Contact_us table created or already exists.');
        // Start the server after database setup is complete
        app.listen(port, () => {
          console.log(`Server is running on http://localhost:${port}`);
        });
      }
    });
  }
});

// Home page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Form submission route
app.post('/submit', (req, res) => {
  const { name, subject, email, phone, message } = req.body;

  // Insert form data into the database
  db.run(
    'INSERT INTO contact_us (name, subject, email, phone, message) VALUES (?, ?, ?, ?, ?)',
    [name, subject, email, phone, message],
    function (err) {
      if (err) {
        console.error('Error inserting data:', err.message);
        res.status(500).send('An error occurred while submitting the form.');
      } else {
        console.log(`A new row with id ${this.lastID} has been inserted.`);
        //res.send('Form data saved successfully!');
        res.sendFile(path.join(__dirname, 'views', 'index.html'));
      }
    }
  );
});

