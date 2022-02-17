require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

// connect DB
const connectDB = (url) => {
  return mongoose.connect(url, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
}

app.use(cors());

// Static
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
})

// Routes
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
})

app.get('/api/shorturl', function(req,res) {
  res.send(req.query)
})

app.post('/api/shorturl', function(req, res) {
  res.send("Post route working")
})


// Basic Configuration
const port = process.env.PORT || 3000

// Start App
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () => 
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
      console.log(error)
  }
}

start()

