import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Users from './dbUsers.js'
import Pusher from 'pusher'
import cors from 'cors'
import path from 'path'
import {
  MONGO_DB_USERNAME,
  MONGO_DB_PASSWORD,
  PUSHER_KEY,
  PUSHER_SECRET,
} from './secrets.js'
// app config
const app = express()
const __dirname = path.resolve()
const pusher =
  process.env.NODE_ENV === 'production'
    ? new Pusher({
        appId: '1526622',
        key: `${process.env.PUSHER_KEY}`,
        secret: `${process.env.PUSHER_SECRET}`,
        cluster: 'eu',
        useTLS: true,
      })
    : new Pusher({
        appId: '1526622',
        key: `${PUSHER_KEY}`,
        secret: `${PUSHER_SECRET}`,
        cluster: 'eu',
        useTLS: true,
      })

if (process.env.NODE_ENV === 'production') {
  // Express serve static files on production environment
  app.use(express.static(path.join(__dirname, 'public')))
} else {
  // Configuring CORS
  const corsOptions = {
    // Make sure origin contains the url your frontend is running on
    origin: [
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://localhost:3000',
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
}


// middleware
app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  next()
})
const port = process.env.PORT || 4000

// DB config
const connection_url =
  process.env.NODE_ENV === 'production'
    ? `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.5ki7k6q.mongodb.net/chat_db?retryWrites=true&w=majority`
    : `mongodb+srv://${MONGO_DB_USERNAME}:${MONGO_DB_PASSWORD}@cluster0.5ki7k6q.mongodb.net/chat_db?retryWrites=true&w=majority`

mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

