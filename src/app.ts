import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';

const app: Application = express()

const whitelist = [process.env.FRONTEND_URL];

const corsOpt: CorsOptions = {
  origin: (origin, calback) => {
    if(whitelist.indexOf(origin) !== -1) {
      calback(null, true);
    }else{
      calback(new Error('Not allowed by cors'));
    }
  }
}

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors(corsOpt));

export default app