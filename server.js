import express from 'express';
import { connectToDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import habitRoutes  from './routes/habitRoutes.js';

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/habits", habitRoutes);

connectToDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});