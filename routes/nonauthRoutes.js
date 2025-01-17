const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index-nonauth', {title: "Start Page", currentPage: "index-nonauth"});
});

module.exports = router;