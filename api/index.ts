import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.get('/', (req: Request, res: Response) => {
    res.render("index", {title: "My Custom Activity"});
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at Port: ${port}`);
})