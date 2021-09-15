const router = require('express').Router();
const verify = require('./verifyToken');

router.get('/home', verify,  (req, res) => {
    res.send("Validation Sucessful");
});

module.exports = router;