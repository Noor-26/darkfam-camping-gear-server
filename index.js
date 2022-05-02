const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express()

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tq1da.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async () => {
    try{
      await client.connect();
      const inventoryCollection = client.db('camping-gear').collection('items');

     app.get('/product',async(req,res) => {
      console.log("hos na k");
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
        console.log('adding new user' , newItem)
        const addItem = await inventoryCollection.insertOne(newItem)
         res.send(addItem)
     })

     app.get('/products',async (req,res) =>{
        const email = req.query.email;
        
        const query = {email:email}
        const cursor = inventoryCollection.find(query) 
        const services = await cursor.toArray()
        res.send(services)
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

