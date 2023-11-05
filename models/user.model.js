const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    username:{
        type: String,
        require: true,
        unique:true,
    },
    password:{
        type: String,
        require: true,
    },
    phone:{
        type: Number,
        // require: true,
    },
});
const User = mongoose.model("User", userSchema);
module.exports = User;


