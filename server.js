require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const connection = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

    connection.query(query, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ message: 'User registration failed: ' + err.message });
      }

      const statsQuery = `INSERT INTO stats (user_id) VALUES (?)`;
      connection.query(statsQuery, [result.insertId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'User registration failed: Could not initialize stats' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'User registration failed: ' + error.message });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';

  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error: ' + err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Login failed: User not found' });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Login failed: Incorrect password' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email },
    });
  });
});

app.post('/update-stats', (req, res) => {
  const { userId, result } = req.body;

  let query;
  if (result === 'win') {
    query = 'UPDATE stats SET wins = wins + 1 WHERE user_id = ?';
  } else if (result === 'loss') {
    query = 'UPDATE stats SET losses = losses + 1 WHERE user_id = ?';
  } else {
    return res.status(400).json({ message: 'Invalid result' });
  }

  connection.query(query, [userId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error: ' + err.message });
    }

    res.status(200).json({ message: 'User stats updated successfully' });
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('chatMessage', (data) => {
    const { username, message } = data;
    const timestamp = new Date().toLocaleTimeString();

    const messageData = {
      username,
      message,
      timestamp
    };

    io.emit('chatMessage', messageData);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
