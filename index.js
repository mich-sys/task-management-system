const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT || 3000;
app.use(express.json());
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

    app.get('/', (req, res) => {
        res.send('Welcome To The Task manager app');
    });

    app.use('/api/auth', require('./routes/auth'));

    app.use('/api/tasks', require('./routes/task'));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});