import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    name: String,
    imgUrl: String
})

export default mongoose.model('user', userSchema)