require('dotenv').config();
const app  = require('./index');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Matth's Houses API → http://localhost:${PORT}`);
});
