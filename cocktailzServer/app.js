const express = require('express')
const model = require('./model')
const bodyParser = require('body-parser')

const app = express()
const PORT = 3000
const CLIENT_PATH = "../cocktailzClient"

app.use(bodyParser.json());

app.use(express.static(CLIENT_PATH))

app.post("/get-cocktails", (req, res) => {
    console.log(req.body)
    model.getMatchingCocktails(req.body)
        .then(results => res.send(results))
        .catch(err => { console.log(err); res.status(500).send() })
})

app.get("/get-ingredients/:prefix", (req, res) => {
    console.log(req.params)
    model.getMatchingIngredients(req.params.prefix)
        .then(results => res.send(results))
        .catch(err => { console.log(err); res.status(500).send() })
})


app.listen(PORT, () => {
    console.log(`Server started, listening to port ${PORT}`)
})


