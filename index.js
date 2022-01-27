const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT ||5000;
const { MongoClient } = require('mongodb');
const ObjectId=require('mongodb').ObjectId;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${ process.env.DB_USER}:${process.env.DB_PASS}@cluster0.crn6x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

async function run() {
  try {
    await client.connect();

    const database = client.db("Travel-Agency");
    const BlogCollection = database.collection("Blogs");
    const userCollection = database.collection("user_info");

    /// get Blog pagination
    app.get('/blog', async (req, res) => {
      const cursor = BlogCollection.find({});
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let blogs;
      const count = await cursor.count();
    
      if (page) {
        blogs = await cursor.skip(page * size).limit(size).toArray();
      }
      else {
        blogs = await cursor.toArray();
      }
    
      res.send({
          count,
          blogs
      })
    });
    

// get all blog
app.get('/blogs', async(req,res)=>{
    const cursor =await BlogCollection.find({}).toArray();
    // console.log(cursor);
    res.send(cursor)
})


// //get single product
app.get('/details/:id', async(req,res)=>{
    const id=req.params.id;
    const query={_id: ObjectId(id)};
    const cursor= await BlogCollection.findOne(query);
    // console.log(cursor);
    res.send(cursor);

})

// //post Blog
app.post('/Blog', async(req,res)=>{
  const doc=req.body;
  const result= await BlogCollection.insertOne(doc);
  // console.log(result);
  res.send(result)
})


// //remove product
app.delete('/blogs/:id', async(req, res)=>{
  const id=req.params.id;
  const query= {_id: ObjectId(id)}
  const result=await BlogCollection.deleteOne(query);
  // console.log(result);
  res.send('delete')
})


// update  Blog information
app.put('/blog/:id', async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  const filter = { _id: ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
      $set: updateData
  };
  const result = await BlogCollection.updateOne(filter, updateDoc, options);

  console.log(result);
  // console.log(req.body);
  res.json(result);
})


//get my blog
app.get('/myBlog/:email', async(req,res)=>{
  const email=req.params.email;
  const cursor={email:email}
  const result= await BlogCollection.find(cursor).toArray();
  console.log(result);
  res.send(result);
})

//update status
app.put('/approvePost/:id', async (req, res) => {
  const id = req.params.id;
  const updateMethod = req.body;
  const filter = { _id: ObjectId(id) };
  const result = await BlogCollection.updateOne(filter, {
    $set: {
      status: 'Approve'
    }
  })

  res.send(result)

})


//post user info
app.post('/users', async (req, res) => {
  const docs = req.body;
  const result = await userCollection.insertOne(docs);
  console.log(result);
  res.send(result)

})

app.put('/users', async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const options = { upsert: true };
  const updateDoc = { $set: user };
  const result = await userCollection.updateOne(filter, updateDoc, options);
  res.json(result);
});

// make addmin
app.put('/addAdmin', async (req, res) => {
  const user = req.body;
  console.log('put', req.headers);
  const filter = { email: user.email };
  const updateDoc = { $set: { role: 'admin' } };
  const doc = await userCollection.updateOne(filter, updateDoc)

  res.send(doc)


})

//check admin

app.get("/checkAdmin/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const result = await userCollection.findOne(query);
  res.send(result);
});


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Welcome to Travel Agency")
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})