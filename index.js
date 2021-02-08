import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';

const app = express()
const port = process.env.PORT || 3000

// middlewares
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

app.use(express.static('public'));

//max size 100Mb
const maxSize = 100 * 1000 * 1000; 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        cb(null, originalname);
    }
})
const upload = multer({ 
    storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
        // allowed file extensions
        let filetypes = /jpeg|jpg|png|doc|docx|xlsx|pptx|ppt|pdf|mp4/;
        let mimetype = filetypes.test(file.mimetype);
        let extname = filetypes.test(path.extname( 
            file.originalname).toLowerCase());

        if (mimetype && extname) { 
            return cb(null, true); 
        }

        cb("unsupported file type"); 
    }
});


app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/upload', upload.array('file'), (req, res) => {
    const path = req.files[0]['path']
    return res.json({ status: 'OK', uploaded: req.files.length });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
});