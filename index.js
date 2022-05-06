const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express()
const  jwt =require('jsonwebtoken');

app.use(cors())
app.use(express.json())


function verifyCode(req,res,next){
    const authCode = req.headers.authorization;
    if(!authCode){
      return res.status(401).send({message:'Please login again'})
    }
    const token = authCode.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded) => {
      if(err){
        return res.status(403).send({message : "go to your home"})
      }
      console.log("decoded message" , decoded);
      req.decoded = decoded
      next()
    })
  }

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tq1da.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async () => {
    try{
      await client.connect();
      const inventoryCollection = client.db('camping-gear').collection('items');

     app.get('/product',async(req,res) => {

        const query = {}
        const cursor = inventoryCollection.find(query)
        const products = await cursor.toArray()
        res.send(products)
     })

     app.get('/product/home',async(req,res) => {
        const query = {}
        const cursor = inventoryCollection.find(query)
        const products = await cursor.limit(6).toArray()
        res.send(products)
     })

     app.delete('/product/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)}
        const result = await inventoryCollection.deleteOne(query)
        res.send(result)
     })

     app.post('/product' , async (req,res)=>{
        const newItem = req.body;
        console.log('adding new item' , newItem)
        const addItem = await inventoryCollection.insertOne(newItem)
         res.send(addItem)
     })

     app.post('/login',async (req,res)=>{
        const user = req.body;
        const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN , {expiresIn:'1d'})
        res.send(accessToken)
     })
     app.get('/products', verifyCode, async (req,res) =>{
    const email = req.query.email;
    const decoded = req.decoded.email
    
    console.log(email,decoded);
     if(email === decoded){
        const query = {email:email}
        const cursor = inventoryCollection.find(query) 
        const items = await cursor.toArray()
        res.send(items)
    }
    else{
      res.status(403).send({message : 'You cannot enter'})
    }
     })

        app.get('/inventory/:id', async(req,res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const item = await inventoryCollection.findOne(query)
            console.log(item)
            res.send(item)
          })
     app.put('/inventory/:id', async(req,res) => {
        const id = req.params.id;
        const newQuantity = req.headers.quantitys;
        console.log(newQuantity)
        const cursor = {_id:ObjectId(id)};
        const options = {upsert:true};
        const updateDoc = {
            $set : {
                quantity : newQuantity
             }
        }
        const result = await inventoryCollection.updateOne(cursor,updateDoc,options)
        res.send(result)
    })

    }
    
    finally{
      
    }
}
run()



app.get('/',(req,res) => {
    res.send('Success the surver is running')
})

app.listen(port,() => {
    console.log('Connections to the port done'); 
})

