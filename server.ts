import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import userRouter from './src/routes/auth.routes';
import { globalErrorHandler } from './src/middleware/globalError';
import bodyParser from 'body-parser';
import passport from 'passport';
import postRouter from './src/routes/post.routes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Load Swagger YAML file
const swaggerDocument = YAML.load('./src/swaggerAPI/swagger.yml');

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1/auth', userRouter);
app.use('api/v1/post', postRouter);
app.get('/', (req, res) => {
  res.send('Hello chetas!');
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    globalErrorHandler(err, req, res, next);
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
