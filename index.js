import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Users from './dbUsers.js'
import Pusher from 'pusher'
import cors from 'cors'
import path from 'path'
// import {
//   MONGO_DB_USERNAME,
//   MONGO_DB_PASSWORD,
//   PUSHER_KEY,
//   PUSHER_SECRET,
// } from './secrets.js'
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
      console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'production') {
  // Express serve static files on production environment
  app.use(express.static(path.join(__dirname, 'dist')))
} else {
  // Configuring CORS
  const corsOptions = {
    // Make sure origin contains the url your frontend is running on
    origin: [
      'http://127.0.0.1:5174',
      'http://localhost:5174',
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
const port = process.env.PORT || 3030

// DB config
const connection_url =
  process.env.NODE_ENV === 'production'
    ? `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.5ki7k6q.mongodb.net/chat_db?retryWrites=true&w=majority`
    : `mongodb+srv://${MONGO_DB_USERNAME}:${MONGO_DB_PASSWORD}@cluster0.5ki7k6q.mongodb.net/chat_db?retryWrites=true&w=majority`

mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const connection = mongoose.connection

connection.once('open', () => {
  console.log('DB connected')

  const msgCollection = connection.collection('messages')
  const changeStream = msgCollection.watch()

  changeStream.on('change', (change) => {
    console.log(change)

    if (change.operationType === 'insert') {
      const messageDetails = change.fullDocument
      pusher.trigger('messages', 'inserted', {
        _id: messageDetails._id,
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        senderId: messageDetails.senderId,
        recieverId: messageDetails.recieverId,
      })
    } else if(change.operationType === 'delete') {
        pusher.trigger('messages', 'deleted', change.documentKey._id)
    }
     else {
      console.log('Error triggering Pusher')
    }
  })
})

// API CHAT MESSAGES ROUTES

app.get('/api/messages/sync', (req, res) => {
  const {receiverId, senderId} = req.query
  const msgCollection = connection.db.collection("messages")
  msgCollection.find({receiverId: {$eq: receiverId}, senderId: {$eq: senderId}}).toArray(function(err, data){
    if (err) res.status(500).send(err)
    else res.status(200).send(data)
  })
})

app.post('/api/messages/new', async (req, res) => {
  const dbMessage = req.body
  const doc = await Messages.create(dbMessage)
  doc.save((err) => {
    if (err) res.status(500).send(err)

    else res.status(200).send(doc)
  })
})

app.delete('/api/messages/delete', (req, res) => {
    const messageId = req.body
    Messages.findById(messageId, (err, message) => {
        if (err) { 
            console.log('DELETE Error: ' + err);
            res.status(500).send('Error');
          } else if (message) {
            message.remove( () => {
              res.status(200).json(message);
            });
         } else {
            res.status(404).send('Not found');
          }
    }
    )
})

// api user routes
app.get('/api/users', (req, res) => {
  Users.find((err, data) => {
    if (err) res.status(500).send(err)
    else res.status(200).send(data)
  })
})
app.get('/api/users/phone', (req, res) => {
  const {phone} = req.query
  const userCollection = connection.db.collection("users")
  userCollection.find({phone: {$eq: phone}}).toArray((err, data) => {
    if (err) res.status(500).send(err)
    else res.status(200).send(data)
  })
})

app.post('/api/users/new', (req, res) => {
  const dbUser = req.body
  Users.create(dbUser, (err, data) => {
    if (err) res.status(500).send(err)
    else res.status(201).send(data)
  })
})

app.post('/api/users/update', async (req, res) => {
  const dbUser = req.body
  const doc = Users.create(dbUser)
  res.send(await doc.save())
})
// listen
app.listen(port, () => console.log(`Wazzup listening on localhost:${port}`))
