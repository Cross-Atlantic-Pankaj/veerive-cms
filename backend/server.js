import app from "./api/index.js";
import dotenv from 'dotenv'

dotenv.config()

console.log('Environment Variables:', {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
});

// Only start the server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const port = process.env.PORT || 3050

  app.listen(port, () => {
      console.log('server is running on port', port)
  })
}
