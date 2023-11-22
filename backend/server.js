const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Courier = require('./models/Courier');


mongoose.connect('mongodb://localhost:27017/testdb');

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('Database connection error:', err);
});

db.once('open', () => {
  console.log('Database connection established');
});

const app = express();
app.use(express.json());

//Register Function
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            const hashedPass = await bcrypt.hash(password, 10);
            await User.create({ role, password: hashedPass, username });
            res.send("User Created Successfully");
        } else {
            res.send("Username already exists");
        }
    } catch (error) {
        res.status(500).send("An Issue Occurred");
    }
});


// Login Function
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { username: user.username, role: user.role },
      'your_secret_key',
      { expiresIn: '1h' }
    );

    res.json({ token,role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Admin viewing couriers list
app.get('/api/admin/couriers', async (req, res) => {
    try {
      const response = await Courier.find();
      res.json({ couriers: response });
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
});

// Admin adding courier
app.post('/api/admin/couriers',async(req,res) => {
    try {
        const {
            courierNumber,
            courierCompany,
            status,
            estimatedDelivery,
            trackingHistory,
            senderName,
            senderAddress,
            receiverName,
            receiverAddress,
            contents,
            additionalInfo
        } = req.body;

        const newCourier = new Courier({
            courierNumber,
            courierCompany,
            status,
            estimatedDelivery,
            trackingHistory,
            senderName,
            senderAddress,
            receiverName,
            receiverAddress,
            contents,
            additionalInfo
        });

        const savedCourier = await newCourier.save();
        res.status(201).json({ courier: "Courier is Added! " });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while adding the courier" });
    }
})

//Admin upadting courier 
app.put('/api/admin/couriers/:courierNumber',async(req,res)=> {
    try {
        const { courierNumber } = req.params;
        const updateData = req.body;

        const updatedCourier = await Courier.findOneAndUpdate(
            { courierNumber: courierNumber },
            updateData,
            { new: true }
        );

        if (!updatedCourier) {
            return res.status(404).json({ message: "Courier not found" });
        }

        res.json({ courier: updatedCourier }); // Return the updated courier as a JSON response
    } catch (error) {
        res.status(500).json({ message: "An error occurred while updating the courier" });
    }
})

// Admin Deleting Courier
app.put('/api/admin/couriers/:courierNumber',async(req,res)=> {
    try {
        const { courierNumber } = req.params;

        const deletedCourier = await Courier.findOneAndDelete({ courierNumber: courierNumber });

        if (!deletedCourier) {
            return res.status(404).json({ message: "Courier not found" });
        }

        res.json({ message: "Courier deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while deleting the courier" });
    }
})


// Logged In users tracking Order
app.get('/api/couriers/:courierNumber',async(req,res) => {
    let trackingId = req.params.courierNumber; // Assuming trackingID is a route parameter
    try {
        const response = await Courier.findOne({ courierNumber: trackingId });
        if (!response) {
            return res.status(404).json({ message: "Courier not found" });
        }
        res.json({ courierDetails: response });
    } catch (error) {
        res.status(500).json({ message: "An error occurred" });
    }
})

const port = process.env.PORT || 5170;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
