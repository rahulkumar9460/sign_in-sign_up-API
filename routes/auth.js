const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../model/User');
const {registerValidation, loginValidation} = require('../validation');


//Register
router.post('/signup', async (req, res) => {

    //validate data before making a user
    const { error } = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    //checing if user already exists in our database
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('Email already exists');

    //password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //creating a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        const savedUser = await user.save();
        res.send({ user: user._id });
    } catch (err) {
        res.status(400).send(err);
    }
});

//Login
router.post('/login', async (req, res) => {
    //validate data
    const { error } = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //checing if user exists in our database
    const user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).send('No account for this email');

    //checking if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send("Password is incorrect");

    //creating and assignning a jwt token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send({ user: user, 'auth-token': token });

});


module.exports = router;