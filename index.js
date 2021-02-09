import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import dotenv  from "dotenv";
import { nanoid } from 'nanoid';
const fs = require('fs');

dotenv.config();
const cloudinary = require('cloudinary', { resource_type: "auto" }).v2
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const db = require('monk')(process.env.MONGO_URI)
db.then(()=> {
    console.log('successfully connected to mongo');
});
// create collection
var urls = db.get('urls');
urls.createIndex('asset_id');

const app = express();
const port = process.env.PORT || 3000;

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
});

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
  res.send('uploader')
});

app.post('/upload', upload.array('file'), async (req, res) => {
    try {
        const path = req.files[0]['path']
        const response = await cloudinary.uploader.upload(path);
        // generate unique ID
        const nanoID = nanoid(6).toLocaleLowerCase();
        const details = {
            asset_id: response['asset_id'],
            format: response['format'],
            secure_url: response['secure_url'],
            original_filename: response['original_filename'],
            mimetype: req.files[0]['mimetype'],
            nanoID
        }

        const created = await urls.insert(details);

        return res.json({ status: 'OK', uploaded: req.files.length, created });
    } catch(e) {
        console.log(e);
        res.json({ status: 'Failure', error: e }).status(500)
    }    
});

// app.get('/url/:id', (req, res)=> {
//     // TODO: get url info by nanoid
// });

app.get('/view/:id', async (req, res) => {
    const { id: nanoID } = req.params;
    try {
        const url = await urls.findOne({ nanoID });
        console.log(url);
        if(url['format'] == "jpg" || url['format'] == "jpeg" || url['format'] == "png") {
            res.redirect(url['secure_url']);
        } 
        if(url['format'] == "pdf") {
            const data = fs.readFileSync('./uploads/'+ url['original_filename'] + '.pdf');
            res.contentType("application/pdf");
            res.send(data);
        }
        else {
            res.json({status: 'Failure', error: `${nanoID}`}).status(500)
        }
    } catch(e) {
        res.json({status: 'Failure', error: 'Database Error'}).status(500)
    }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
});
