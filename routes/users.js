const express = require("express")
const router = express()

router.get("/", (req, res) => {
    res.send("User List")
})

router.get("/new", (req, res) => {
    res.send("User New Form")
})

module.exports = router