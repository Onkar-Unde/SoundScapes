import mongoose from 'mongoose';

const playlistItemSchema = new mongoose.Schema({
    soundscapeIndex: { type: Number, required: true },
    duration: { type: Number, required: true },
    url: { type: String, required: true }, // Added url field
});

const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    items: [playlistItemSchema],
});

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;