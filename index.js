require('dotenv').config();
const connectToMongo = require ('./data');
const express = require('express');
const app = express();
const port = 5000
connectToMongo();
var cors = require('cors');

app.use(cors({
  origin: 'https://anushkanotes.netlify.app',
  credentials: true,
}));

app.use(express.json());
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, () => {
  console.log(` iNotebook backend listening on port ${port}`)
})
  