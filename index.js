import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import dotenv  from "dotenv";
import { nanoid } from 'nanoid';
import fs from 'fs';
import { exec } from "child_process";
var ppt2png = require('ppt2png');

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

        if (extname) { 
            return cb(null, true); 
        }

        cb("unsupported file type"); 
    }
});


app.post('/upload', upload.array('file'), async (req, res) => {
        const path = req.files[0]['path']
        console.log(req.files)
        // generate unique ID
        const nanoID = nanoid(6).toLocaleLowerCase();
        if(req.files[0]['originalname'].split('.')[1] == "pptx"|"ppt") {
            const localDetails = {
                original_filename: req.files[0]['originalname'],
                mimetype: req.files[0]['mimetype'],
                path: req.files[0]['path'],
                format: "pptx",
                // presentation: localDetails.original_filename,
                date: new Date(),
                nanoID
            }

            // convert ppt to png
            // const converter = Converter.create({
            //     files:  [localDetails.original_filename],
            //     output: 'uploads/'
            // });
            // const result = converter.convert();
            // console.log(result);

            const ppt = await urls.insert(localDetails);
            return res.json({
                status: `local upload ${req.files[0]['originalname']}`,
                uploaded: ppt
            })
        }
        
        try {
        const response = await cloudinary.uploader.upload(path);
        
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
        return res.json({ status: 'Can not upload to cloudinary', error: e }).status(500)
    }    
});

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

app.get('/pdf2image/:id', async (req, res) => {
    const { id: nanoID } = req.params;
    try {
        const result = await urls.findOne({ nanoID });
        if(result['format'] == "pdf"){

            const filename = './uploads/' + result.original_filename + '.pdf'
           
            exec("python pdf2jpg.py " + `${filename}`+ " ./uploads", (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                return res.json({ status: filename });
            });
        } else {
            return res.json({error: 'not a pdf'})
        }
    } catch(e) {
        console.log(e)
    }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
});
