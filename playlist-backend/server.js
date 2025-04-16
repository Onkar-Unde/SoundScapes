import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import playlistRoutes from './routes/playlists.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/playlists', playlistRoutes);

mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-playlist-app', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });