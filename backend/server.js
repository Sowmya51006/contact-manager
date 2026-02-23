require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Contact = require('./models/Contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes

// 1. Save new contact
app.post('/api/contacts', async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ message: 'Name and Phone are required' });
        }
        const newContact = new Contact({ name, phone, email, address });
        await newContact.save();
        res.status(201).json(newContact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Get all contacts
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Search contacts
app.get('/api/contacts/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.json([]);
        }
        const contacts = await Contact.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Update contact
app.put('/api/contacts/:id', async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            { name, phone, email, address },
            { new: true }
        );
        if (!updatedContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json(updatedContact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Delete contact
app.delete('/api/contacts/:id', async (req, res) => {
    try {
        const deletedContact = await Contact.findByIdAndDelete(req.params.id);
        if (!deletedContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
