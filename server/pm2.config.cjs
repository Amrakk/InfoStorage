require("dotenv").config();

module.exports = {
    apps: [
        {
            name: "test",
            script: "build/server.js",
            instances: 4,
            env: { ...process.env },
        },
    ],
};
