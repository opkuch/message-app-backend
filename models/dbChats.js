import mongoose from "mongoose"

const chatSchema = mongoose.Schema({
    user_1: Object,
    user_2: Object,
    messages: Array,
    lastMessageAt: Number,
})

export default mongoose.model('chats', chatSchema, 'chats')