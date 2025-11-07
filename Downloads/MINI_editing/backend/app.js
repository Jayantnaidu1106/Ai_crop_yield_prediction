import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/users.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import fileRoutes from './routes/file.routes.js';
import messageRoutes from './routes/message.routes.js';

connect();

const app = express();

app.use(cors());
app.use(morgan('dev'));


app.use((req, _res, next) => {
    if (req.headers['content-type'] === 'text/plain' && req.method === 'POST') {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                req.body = JSON.parse(data);
            } catch (e) {
                req.body = data;
            }
            next();
        });
    } else {
        next();
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_req, res) => {
    res.send('Hello From home');
});

app.use('/users',userRoutes);
app.use('/project',projectRoutes);
app.use('/ai', aiRoutes);
app.use('/files', fileRoutes);
app.use('/messages', messageRoutes);

export default app;