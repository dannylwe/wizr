import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';

const app = express()
const port = process.env.PORT || 3000

// middlewares
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        cb(null, originalname);
    }
})
const upload = multer({ storage });


app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/upload', upload.array('file'), (req, res) => {
    return res.json({ status: 'OK', uploaded: req.files.length });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
});