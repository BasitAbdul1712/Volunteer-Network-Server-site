var express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
require('dotenv').config()
const admin = require('firebase-admin');
const ObjectId = require('mongodb').ObjectId;

var app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 5000;

var serviceAccount = require("./volunteer-network-40f99-firebase-adminsdk-b7bpo-dd068f802f.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://volunteer-network-40f99.firebaseio.com"
});


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cf5dp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const volunteerActivities = client.db("VolunteerNetwork").collection("activities");
    const selectedTask = client.db("VolunteerNetwork").collection("selectedTask");
    const addEvent = client.db("VolunteerNetwork").collection("events");


    app.post('/addActivity', (req, res) => {
        const activity = req.body;
        volunteerActivities.insertOne(activity)
            .then(result => {
                //    console.log(result.insertedCount);
                res.send(result.insertedCount);
            })
    })

    app.post('/addEvent', (req, res) => {
        const event = req.body;
        addEvent.insertOne(event)
            .then(result => {
                 console.log(result.insertedCount);
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/events', (req, res) => {
        addEvent.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.get('/activities', (req, res) => {
        volunteerActivities.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.get('/activities/:id', (req, res) => {
        volunteerActivities.find({ id: req.params.id })
            .toArray((err, documents) => {
                // console.log(documents);
                res.send(documents[0])
            })
    })

    app.post('/addTask', (req, res) => {
        const task = req.body;
        selectedTask.insertOne(task)
            .then(result => {
                //  console.log(result.insertedCount);
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/addTask/taskId', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail == queryEmail) {
                        selectedTask.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.send(documents)
                            })
                    }

                }).catch(function (error) {
                });
        }
        // console.log(req.query.email);

    })

    app.delete('/taskDelete/:id', (req, res) =>{
        selectedTask.deleteOne({_id: ObjectId(req.params.id)})
        .then(result => {
            console.log(result);
            res.send(result);
        })
    } )

    app.get('/adminsArea', (req, res) => {
        selectedTask.find({})
            .toArray((err, documents) => {
            // console.log(documents)
                res.send(documents)
            })
    })
    

});



app.get('/', function (req, res) {
    res.send('hello Network Volunteer');
});

app.listen(process.env.PORT || port)