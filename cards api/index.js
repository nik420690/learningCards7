require("./DB/dbConn")
const express = require("express")
const multer = require("multer")
const Card = require("./DB/Models/Card")
const Deck = require("./DB/Models/Deck")
const User = require("./DB/Models/User")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const DIR = "./public/"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR)
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-")
    cb(null, "123" + "-" + fileName)
  },
})

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true)
    } else {
      cb(null, false)
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"))
    }
  },
})

const auth = async (req, res, next) => {
  const token = req.headers.authorization
  try {
    const payload = await jwt.verify(token, "secretstring")
    const isExist = await User.findOne({ _id: payload._id })

    if (isExist) {
      next()
    } else {
      res.json({
        error: true,
        message: "you are not authorized user, please login.",
      })
      return
    }
  } catch (e) {
    res.json({
      error: true,
      message: "you are not authorized user, please login.",
    })
  }
}

app.post("/deck", auth, async (req, res) => {
  const { title } = req.body
  try {
    const newDeck = new Deck({ title })
    await newDeck.save()
    res.json({ error: false, message: "New Deck added successfully" })
  } catch (e) {
    res.json({ error: true, message: "Something went wrong." })
  }
})

app.get("/deck", auth, async (req, res) => {
  const { _id } = req.query
  try {
    const deck = await Deck.findById({ _id }).populate("cards")
    res.json({ error: false, deck })
  } catch (e) {
    res.json({ error: true, message: "Something went wrong." })
  }
})

app.put("/deck", auth, async (req, res) => {
  const { _id, title } = req.body
  try {
    await Deck.findByIdAndUpdate({ _id }, { title })
    res.json({ error: false, message: "Title of Deck updated successfully." })
  } catch (e) {
    res.json({
      error: true,
      message: "Id does not match with records Or Something went Wrong.",
    })
  }
})

app.delete("/deck", auth, async (req, res) => {
  const { _id } = req.query
  try {
    await Deck.findByIdAndDelete({ _id })
    res.json({ error: false, message: "Deck of cards deleted successfully." })
  } catch (e) {
    res.json({
      error: true,
      message: "Id does not match with records Or Something went Wrong.",
    })
  }
})
app.post("/addcardtodeck", auth, async (req, res) => {
  const { cardId, deckId } = req.body
  try {
    var deck = await Deck.findById({ _id: deckId })
    deck.cards.push(cardId)
    await Deck.findByIdAndUpdate({ _id: deckId }, deck)
    res.json({ error: false, message: "Successfully added a card in deck." })
  } catch (e) {
    res.json({ error: true, message: "Something went wrong." })
  }
})

app.post("/card", auth, upload.single("picture"), async (req, res) => {
  const url = req.protocol + "://" + req.get("host")

  const { question, answer } = req.body
  try {
    const newCard = new Card({
      question,
      answer,
      picture: req.file ? url + "/public/" + req.file.filename : "",
    })
    await newCard.save()
    res.json({ error: false, message: "Card added successfully." })
  } catch (e) {
    res.json({ error: true, message: "Something went wrong." })
  }
})

app.get("/card", auth, async (req, res) => {
  const { _id } = req.query
  try {
    const card = await Card.findById({ _id })
    res.json({ error: false, card })
  } catch (e) {
    res.json({ error: true, message: "Something went wrong." })
  }
})

app.put("/card", auth, async (req, res) => {
  const { _id, question, answer } = req.body

  try {
    await Card.findByIdAndUpdate({ _id }, { _id, question, answer })
    res.json({ error: false, message: "Card data updated successfully." })
  } catch (e) {
    res.json({
      error: true,
      message: "Id does not match with records Or Something went Wrong.",
    })
  }
})

app.delete("/card", auth, async (req, res) => {
  const { _id } = req.query
  try {
    await Card.findByIdAndDelete({ _id })
    res.json({ error: false, message: "Card deleted successfully." })
  } catch (e) {
    res.json({
      error: true,
      message: "Id does not match with records Or Something went Wrong.",
    })
  }
})

app.get("/cards", auth, async (req, res) => {
  try {
    const cards = await Card.find({})
    res.json({ error: false, cards })
  } catch (e) {
    res.json({ error: true, message: "Something went wrong." })
  }
})

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body
  try {
    const IsUserExist = await User.findOne({ username })
    if (IsUserExist) {
      res.json({
        error: true,
        message: "User already exist with this username.",
      })
      return
    }
    const IsUserExist2 = await User.findOne({ email })
    if (IsUserExist2) {
      res.json({ error: true, message: "User already exist with this email." })
      return
    }


    const newUser = new User({
      username,
      email,
      password,
    })
    await newUser.save()
    res.json({ error: false, message: "User registered successfully. " })
  } catch (e) {
    res.json({ error: true, message: "Something went wrong." })
  }
})

app.post("/login", async (req, res) => {
  const { username, password } = req.body
  try {
    const isUserExist = await User.findOne({ username })
    if (!isUserExist) {
      res.json({ error: true, message: "Username or password is not correct." })
      return
    }

    if (password==isUserExist.password) {
      const token = await jwt.sign({ _id: isUserExist._id }, "secretstring")
      res.json({ error: false, message: "Login Successfully.", token })
    } else {
      res.json({ error: true, message: "Username or password is not correct." })
    }
  } catch (e) {
    res.json({ error: true, message: "Something went wrong." })
  }
})

app.post("/syncdata", auth, async (req, res) => {
  //console.log("here")
  const cards = req.body.cards
  try {
    await Card.deleteMany()
    for (let i = 0; i < cards.length; i++) {
      let newCard = new Card({
        question: cards[i].question,
        answer: cards[i].answer,
      })
      await newCard.save()
    }

    res.json({ message: "successfuly synced data." })
  } catch (e) {
    res.json({ error: true, message: "Something went wrong" })
  }
})

app.listen(5001, () => {
  console.log("server is running successfully...")
})

//testing git