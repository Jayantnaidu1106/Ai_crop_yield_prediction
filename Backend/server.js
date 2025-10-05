// server.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Load environment variables first
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`Server accessible at http://localhost:${PORT}`);
});