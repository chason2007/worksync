const handleProfileImageUpload = async (user, file, res) => {
    try {
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Convert buffer to Base64
        const b64 = Buffer.from(file.buffer).toString('base64');
        const mimeType = file.mimetype;
        user.profileImage = `data:${mimeType};base64,${b64}`;

        await user.save();

        return res.json({
            message: 'Profile image uploaded successfully',
            profileImage: user.profileImage, // Send back the full Base64 string for immediate UI update
            user: { ...user.toObject(), password: undefined }
        });
    } catch (err) {
        console.error('Upload Error:', err);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { handleProfileImageUpload };
