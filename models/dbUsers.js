import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    name: String,
    phone: String,
    contacts: Array,
})

export default mongoose.model('user', userSchema)