import app from './app';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { socket } from './socket';
const PORT = process.env.PORT || 5000;

const server = createServer(app);
// Attach socket logic to server
socket(server);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  server.listen(PORT, '0.0.0.0', () =>
    console.log(`Server is running on port ${PORT}`)
  );
});
