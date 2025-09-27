// server.js

const app = require('./app');
require('dotenv').config(); // Load environment variables

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});