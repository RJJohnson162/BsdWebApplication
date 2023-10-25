const express = require('express');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const { model, Schema, models } = mongoose;

const app = express();
const port = 7237; // Adjust the port to 7237

// script.js

// Handle form submission
async function saveInfo(event) {
    event.preventDefault();

    // Get values from form fields
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const idNumber = document.getElementById('id_number').value;
    const gender = document.querySelector('input[name="radio"]:checked').value;
    const course = document.querySelector('input[name="radio1"]:checked').value;

    // Create a data object to send to the server
    const studentData = {
        first_name: firstName,
        last_name: lastName,
        id_number: idNumber,
        Gender: gender,
        Course: course,
    };

    const displayDiv = document.getElementById('displayData');
    displayDiv.innerHTML = `
        <p>First Name: ${studentData.first_name}</p>
        <p>Last Name: ${studentData.last_name}</p>
        <p>ID Number: ${studentData.id_number}</p>
        <p>Gender: ${studentData.Gender}</p>
        <p>Course: ${studentData.Course}</p>
    `;

    // Send the data to the server
    try {
        const response = await fetch('/Index', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData),
        });

        if (response.ok) {
            // Data saved successfully
            console.log('Data saved successfully');
            alert('Your Data has been saved successfully');
            // Optionally, reset the form here if needed
            document.getElementById('studentForm').reset();
        } else {
            // Handle errors
            console.error('Error in saving data');
            alert('Error in saving your Data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error);
        alert("Something went wrong!!!");
    }

}


// MongoDB connection setup
const mongoUri = 'mongodb+srv://your-connection-string'; // Replace with your actual MongoDB connection string
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const client = new MongoClient(mongoUri, mongoOptions);
const db = client.db();

async function connectToMongo() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error', err);
    }
}

// Mongoose setup
mongoose.connect(mongoUri, mongoOptions);

// Define the Student schema
const StudentSchema = new Schema(
    {
        first_name: { type: String, required: true },
        last_name: String,
        id_number: { type: Number, required: true },
        Gender: { type: String, required: true },
        Course: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const Student = models.Student || model('Student', StudentSchema);

// Middleware to parse JSON in requests
app.use(express.json());

// Define a route to save student data
app.post('/Index', async (req, res) => {
    try {
        const studentData = req.body;

        const result = await Student.create(studentData);

        if (result) {
            res.status(201).json({ message: 'Data saved successfully' });
        } else {
            res.status(500).json({ error: 'Error saving data' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve your HTML form at the specified URL
app.get('/Index', (req, res) => {
    res.sendFile(__dirname + '/pages/index.cshtml');
});

// Start the server
async function startServer() {
    await connectToMongo();
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

startServer();
