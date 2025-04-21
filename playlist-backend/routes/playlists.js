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