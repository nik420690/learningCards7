const mongoose=require('mongoose')

const deckSchema=new mongoose.Schema({
    title:String,
    cards:[{type: mongoose.Schema.Types.ObjectId,ref:'Card',required:false}]
})

const Deck=new mongoose.model('Deck',deckSchema)
module.exports=Deck;