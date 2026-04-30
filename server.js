// server.js
// -------------------------------------------------------------
// Local development entry. Vercel uses api/index.js instead and
// never executes this file.
// -------------------------------------------------------------

const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Doctor AI Assistant running at http://localhost:${PORT}`);
});
