const { Schema, model } = require('mongoose');
const { createHmac, randomBytes } = require("crypto");
const{createTokenForUser,validateToken} = require("../services/authentication.js")
const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: 'https://via.placeholder.com/150'
    }
}, { timestamps: true });

// Pre-save hook to hash the password before saving
userSchema.pre("save", function (next) {
    const user = this;
    
    // Proceed only if the password has been modified
    if (!user.isModified("password")) return next();

    // Generate a salt and hash the password
    const salt = randomBytes(16).toString('hex');  // Specify 'hex' encoding
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');
    
    // Set the salt and hashed password on the user document
    this.salt = salt;
    this.password = hashedPassword;
    next();
});

// Method to validate password
userSchema.methods.validatePassword = function (password) {
    const hash = createHmac('sha256', this.salt).update(password).digest('hex');
    return this.password === hash;
}

userSchema.static('matchPasswordAndGenerateToken',async function(email,password){
    const user = await User.findOne({email})
    if(!user){
        throw new Error("User not found")
    }
    const salt = user.salt;
    const hashedPassword = user.password;
    const userProvidedPassword = createHmac('sha256',salt).update(password).digest('hex')
    if(userProvidedPassword !== hashedPassword){
        throw new Error("Incorrect password")
    }

    const token = createTokenForUser(user)
    return token;

})

const User = model("User", userSchema);

module.exports = User;
