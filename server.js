import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Rooms from './dbRooms.js'
import Users from './dbUsers.js'
import Pusher from 'pusher'
import cors from 'cors'
import path from 'path';
// import {MONGO_DB_USERNAME, MONGO_DB_PASSWORD, PUSHER_KEY, PUSHER_SECRET} from './secrets.js'
// app config
const app = express()
const port = process.env.PORT || 4000
const __dirname = path.resolve();

const pusher = new Pusher({
    appId: "1486714",
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: "eu",
    useTLS: true
  })

  if (process.env.NODE_ENV === 'production') {
    // Express serve static files on production environment
    app.use(express.static( __dirname, 'public'))
} else {
    // Configuring CORS
    const corsOptions = {
        // Make sure origin contains the url your frontend is running on
        origin: ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://localhost:3000'],
        credentials: true
    }
    app.use(cors(corsOptions))
}



// middleware
app.use(express.json())

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "*")
    next()
})

// DB config
const connection_url =
  `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.5ki7k6q.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection

db.once('open', () => {
    console.log('DB connected')

    const msgCollection = db.collection("messagecontents")
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change) => {
        console.log(change)

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument
             pusher.trigger("messages", "inserted", {
                _id: messageDetails._id,
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
                roomId: messageDetails.roomId
             })
        } else {
            console.log("Error triggering Pusher")
        }
    })
})

// api chat routes
app.get('/', (req, res) => res.status(200).send('hello world'))


app.get('/api/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) res.status(500).send(err)
        else res.status(200).send(data)      
    })
})

app.post('/api/messages/new', (req, res) => {
    const dbMessage = req.body
    Messages.create(dbMessage, (err, data) => {
        if (err) res.status(500).send(err)
        else res.status(201).send(data)      
    })
})

app.get('/api/rooms', (req, res) => {
    Rooms.find((err, data) => {
        if (err) res.status(500).send(err)
        else res.status(200).send(data)      
    })
})

app.post('/api/rooms/new', (req, res) => {
    const dbRoom = req.body
    Rooms.create(dbRoom, (err, data) => {
        if (err) res.status(500).send(err)
        else res.status(201).send(data)      
    })
})

// api user routes
app.get('/api/users', (req, res) => {
    Users.find((err, data) => {
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

// listen
app.listen(port, () => console.log(`Listening on localhost:${port}`))
