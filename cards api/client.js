const axios=require('axios')
const config = require('./config');

//POST Request for Card
axios.post('http://localhost:3000/card',{question:"What is your name?",answer:"John"}).then((response=>{
    console.log(response.data)
})).catch(e=>console.log(e))

//GET Request for Card
axios.get('http://localhost:3000/card?_id=64061260e752a10281805a69').then((response)=>{
    console.log(response.data)
}).catch((e)=>{
    console.log(e)
})

//PUT Request for Card
axios.put('http://localhost:3000/card',{
    _id:'64061260e752a10281805a69',
    answer:"Smith",
    question:"Name?"
}).then((response)=>{
    console.log(response.data)
}).catch((e)=>console.log(e))


//DELETE Request for Card
axios.delete('http://localhost:3000/card?_id=64061260e752a10281805a69')
.then((response)=>{
    console.log(response.data)
}).catch((e)=>console.log(e))

//GET Request to get all the cards
axios.get('http://localhost:3000/cards').then((response)=>{
    console.log(response.data)
}).catch((e)=>console.log(e))


//POST Request for Register
axios.post('http://localhost:3000/register',{
    username: config.username,
    email:"smith@gmail.com",
    password: config.password
}).then((response)=>console.log(response.data))
.catch((e)=>console.log(e))


//POST Request for Login
axios.post('http://localhost:3000/login',{
    username: config.username,
    password: config.password
}).then((response)=>console.log(response.data))
.catch((e)=>console.log(e))


//POST Request for Deck
axios.post('http://localhost:3000/deck',{
    title:"Web"
}).then((response)=>console.log(response.data))
.catch((e)=>console.log(e))

//GET Request for Deck
axios.get('http://localhost:3000/deck?_id=6406193da7ee0b6e119210c9')
.then((response)=>console.log(response.data))
.catch((e)=>console.log(e))

//PUT Request for Deck
axios.put('http://localhost:3000/deck',
{_id:'64061971a7ee0b6e119210cd',
title:'web3'})
.then((response)=>console.log(response.data))
.catch((e)=>console.log(e))

//DELETE Request for Deck
axios.delete('http://localhost:3000/deck?_id=6406193da7ee0b6e119210c9')
.then((response)=>console.log(response.data))
.catch((e)=>console.log(e))

//POST Request for adding a card to deck
axios.post('http://localhost:3000/addcardtodeck',
{deckId:'64061971a7ee0b6e119210cd',
cardId:'640612fce752a10281805a6d'})
.then((response)=>console.log(response.data))
.catch((e)=>console.log(e))
