var express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
require('dotenv').config()

var app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 5000;

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cf5dp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});

client.connect(err => {
  const volunteerActivities = client.db("VolunteerNetwork").collection("activities");
 
  app.post('/addActivity', (req, res) => {
      const activity = req.body;
      volunteerActivities.insertMany(activity)
      .then(result =>{
           console.log(result.insertedCount);
          res.send(result.insertedCount);
      })
  })

  app.get('/activities', (req, res) => {
      volunteerActivities.find({})
      .toArray((err, documents) => {
          res.send(documents)
      })
  })

  app.get('/activities/:id', (req, res) => {
    volunteerActivities.find({id: req.params.id})
    .toArray((err, documents) => {
        console.log(documents);
        res.send(documents[0])
    })
})


});



app.get('/', function(req, res) {
  res.send('hello Network Volunteer');
});

app.listen(port)