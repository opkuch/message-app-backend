import mongoose from "mongoose"

const wazzupSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean,
    roomId: String
})

export default mongoose.model('messagecontents', wazzupSchema)