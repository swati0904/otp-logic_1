const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT ;

// Enable CORS for all routes
app.use(cors());
app.get("/",(req,res)=>{
  res.send("HELL ITS WORKING");
})

app.use(bodyParser.json());

// MongoDB setup (replace 'your_mongo_connection_string' with your actual MongoDB connection string)
mongoose.connect('mongodb+srv://swati:swati0920@cluster0.j7atkns.mongodb.net/?retryWrites=true&w=majority', { });

// Define a user schema and model
const userSchema = new mongoose.Schema({
  email: String,
  otp: String,
  isVerified: Boolean,
});

const User = mongoose.model('User', userSchema);

// Nodemailer setup (replace with your actual email service credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'swati.singh.ug20@nsut.ac.in',
    pass: 'lnud rhhv ardt lgky',
  },
});

// Express routes
app.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Generate a random OTP (you might want to use a library for this)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save the OTP in the database
    const user = await User.findOneAndUpdate(
      { email },
      { otp, isVerified: false },
      { new: true, upsert: true }
    );

    // Send the OTP to the user's email
    const mailOptions = {
      from: 'swati.singh.ug20@nsut.ac.in',
      to: email,
      subject: 'Verification OTP',
      text: `Your OTP for verification is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP email:', error);
        res.status(500).json({ error: 'Error sending OTP email' });
      } else {
        console.log('OTP sent:', info.response);
        res.status(200).json({ message: 'OTP sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error in /send-otp:', error);
    return  res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if the provided OTP matches the stored OTP
    const user = await User.findOne({ email, otp, isVerified: false });

    if (user) {
      // Mark the user as verified
      user.isVerified = true;
      await user.save();
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error in /verify-otp:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Endpoint to get the list of colleges
app.get('/colleges', (req, res) => {
  // Read the colleges.json file and send its content as the response
  const colleges = require('./colleges.json');
  res.json(colleges);
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
