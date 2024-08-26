const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Configure CORS for Express
app.use(cors());
app.use(express.json())

const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  }
});

let totalAmount = 0;

// Socket.IO setup
io.on('connection', (socket:any) => {

  // Emit the current total to the new client
  socket.emit('total', totalAmount);

  // Listen for 'add' and 'remove' events
  socket.on('add', (amount:any) => {
    if (typeof amount === 'number') {
      totalAmount += amount;
      io.emit('total', totalAmount); // Emit updated total to all clients
    }
  });

  socket.on('remove', (amount:any) => {
    if (typeof amount === 'number') {
      totalAmount -= amount;
      io.emit('total', totalAmount); // Emit updated total to all clients
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Endpoint to get the total amount
app.get("/total", (req:any, res:any) => {
  res.json({ total: totalAmount });
});


// Endpoint to add amount
app.post("/add", (req:any, res:any) => {
    const { amount } = req.body;
    if (typeof amount === "number") {
      totalAmount += amount;
      io.emit('total', totalAmount); //Globally Emit updated total to all clients
      res.json({ message: "Amount added", total: totalAmount });
    } else {
      res.status(400).json({ message: "Invalid amount" });
    }
});

// Endpoint to remove amount
app.post("/remove", (req:any, res:any) => {
  const { amount } = req.body;
  if (typeof amount === "number") {
    totalAmount -= amount;
    io.emit('total', totalAmount); //? Globally Emit updated total to all clients
    res.json({ message: "Amount removed", total: totalAmount });
  } else {
    res.status(400).json({ message: "Invalid amount" });
  }
});

// Start the server
server.listen(3000, () => {
  console.log("Finance app is running on http://localhost:3000");
});
