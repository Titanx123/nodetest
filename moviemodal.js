const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String
});

const movieSchema = new mongoose.Schema({
    Movie_Name : {
        type: String,
        required: true
    },
    Rating: {
        type: Number,
        required: true
    },
    Cast: {
        type: Array,
        required : true
    },
    Genre: {
        type: String,
        required: true
    },
    user: String,
    Date: {
        type: String
    }
});

const userModel = mongoose.model("user",userSchema);
const movieModal  = mongoose.model("movie",movieSchema);


module.exports = {userModel,movieModal};