const mongoose=require('mongoose')

mongoose.connect('mongodb+srv://Rok:Feri123!@cluster0.bkl6gj5.mongodb.net/FlashCards').then(()=>{
    console.log("db connected successfully...")
}).catch((e)=>{
    console.log("Something went wrong with db connection.")
})
