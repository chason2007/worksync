const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const updateAvatar = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employeeDB');
        const updated = await User.findOneAndUpdate(
            { email: { $regex: new RegExp('^admin@worksync.com$', 'i') } },
            { profileImage: 'settings-avatar.png' },
            { new: true }
        );
        if (updated) console.log("Updated avatar for:", updated.email);
        else console.log("Admin not found.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
updateAvatar();
