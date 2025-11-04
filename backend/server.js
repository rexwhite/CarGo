const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from CarGo!' });
});

app.listen(PORT, () => {
  console.log(`CarGo server running on port ${PORT}`);
});
