import mongoose from "mongoose"

const messageSchema = mongoose.Schema({
    senderId: String,
    receiverId: String,
    message: String,
    name: String,
    timestamp: String,
})

export default mongoose.model('messages', messageSchema, 'messages')