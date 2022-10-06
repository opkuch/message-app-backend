import mongoose from "mongoose"

const roomSchema = mongoose.Schema({
    name: String,
})

export default mongoose.model('room', roomSchema)