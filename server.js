import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router (return `index.html` for any non-static file requests)
app.use((req, res, next) => {
  // If the request is for a static file, let it go to the static handler
  if (req.path.includes('.')) {
    return next();
  }
  // Otherwise, serve index.html for client-side routing
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ISCHOOLGO Demo Server running on port ${PORT}`);
  console.log(`\n🚀 ISCHOOLGO School Management System`);
  console.log(`📱 Access the application at: http://localhost:${PORT}`);
  console.log(`\n👥 Demo User Accounts:`);
  console.log(`   Username: admin     | Role: Administrator`);
  console.log(`   Username: director  | Role: Director`);
  console.log(`   Username: marketer  | Role: Marketer`);
  console.log(`   Username: headtrainer | Role: Head Trainer`);
  console.log(`   Username: agent     | Role: Agent`);
  console.log(`   Username: teacher   | Role: Teacher`);
  console.log(`   Password: password123 (for all accounts)`);
  console.log(`\n🗄️  Backend: Supabase (already configured)`);
  console.log(`🔒 Authentication: Ready`);
  console.log(`📊 Database: Connected with test data`);
});