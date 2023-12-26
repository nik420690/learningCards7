const mongoose=require('mongoose')

const cardSchema=new mongoose.Schema({
    question:String,
    answer:String,
    picture:String
})

const Card=new mongoose.model('Card',cardSchema)
module.exports= Card;