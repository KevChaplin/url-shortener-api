require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { Schema } = mongoose
const bodyParser = require('body-parser')
const dns = require('dns')

const app = express()
app.use(cors());

// Connect DB
const connectDB = (url) => {
  return mongoose.connect(url)
}

// Schema
const shortUrlSchema = new Schema ({
  original_url: String,
  short_url: Number,
})
const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema)

// Static
app.use('/public', express.static(`${process.cwd()}/public`));

// Middleware
app.use(bodyParser.urlencoded({extended: false}))

// Routes

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
})

app.get('/api/shorturl/:shorturl', async (req,res) => {
  try {
    const shorturl = req.params.shorturl
    // check for undefind or empty shorturl
    if (!shorturl || shorturl == 'undefined') { 
      return res.json({error: "no matching short url"}) 
    }
    const document = await ShortUrl.findOne({short_url: shorturl}).exec()
    if (!document) {
      res.json({error: "no matching short url"})
    } else {
      res.redirect(document['original_url'])
    }   
  } catch (err) {
    console.log(err)
    return
  } 
})

app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body
  try {
    // Create new URL object ( Node.js) so that I can extract only host ( i.e. no protocol or paths) using URL.host.
    const inputUrl = new URL(url)
    // Check if url is http and valid
    if ( !inputUrl.protocol.startsWith('http') ) { throw new Error('not http address')}
    dns.lookup( inputUrl.host, () => {
      console.log("valid url")
    })
    // Get all entries from Db, sort, add one to highest short_url for new short_url
    ShortUrl.find({})
      .sort({ 'short_url': -1 })
      .exec(function (err, result) {

        if (err) { console.log(err)} ;
        // Set short_url
        const newShortUrl = (result.length !== 0) ? result[0]['short_url'] + 1 : 1
        // Response object
        const urlObj = {
          original_url: inputUrl,
          short_url: newShortUrl
        }
        // Create Db document
        const urlDoc = new ShortUrl(urlObj)
        urlDoc.save()
        // Send response
        res.json(urlObj)
    })
    
  } catch (err) {
    console.log(err)
    res.json({error: 'invalid url'})
    return
  } 
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