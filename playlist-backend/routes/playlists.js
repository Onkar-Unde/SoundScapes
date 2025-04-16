import { Router } from 'express';
import Playlist from '../models/playlist.js';

const router = Router();

// Get all playlists
router.get('/', async(req, res) => {
    try {
        const playlists = await Playlist.find();
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

// Create a new playlist
router.post('/', async(req, res) => {
    try {
        const { name, description, items } = req.body;
        const playlist = new Playlist({ name, description, items });
        await playlist.save();
        res.status(201).json(playlist);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

// Update a playlist
router.put('/:id', async(req, res) => {
    const { id } = req.params;
    const { name, description, items } = req.body;

    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            id, { name, description, items }, { new: true }
        );

        if (!updatedPlaylist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        res.json(updatedPlaylist);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update playlist' });
    }
});

// Delete a playlist
// In your Express router file
router.delete('/api/playlists/:id', async(req, res) => {
    try {
        const deletedPlaylist = await Playlist.findByIdAndDelete(req.params.id);
        if (!deletedPlaylist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }
        res.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;