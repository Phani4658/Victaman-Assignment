const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Courier = require('./models/Courier');
const cors = require('cors');

mongoose.connect('mongodb+srv://admin:admin@123@cluster0.oaxomus.mongodb.net/');

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('Database connection error:', err);
});

db.once('open', () => {
  console.log('Database connection established');
});
const app = express();
app.use(express.json());    
app.use(cors());


//Register Function
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            await User.create({ role, password, username });
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
  console.log(req);
  const { username, password } = req.body;
  console.log(username,password);
  try {
    const user = await User.findOne({ username });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const passwordMatch = user.password === password;

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({ role: user.role });
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
