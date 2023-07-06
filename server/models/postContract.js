import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    code: String,
    title: String,
    creator: String, 
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

let PostContract = mongoose.model('PostContract', postSchema);

export default PostContract;