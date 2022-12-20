import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    name: String,
    phoneNumber: String,
    contacts: Array
})

export default mongoose.model('user', userSchema)