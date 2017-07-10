const path 			= require('path'),
			multer 		= require('multer'),
			fse 			= require('fs-extra')

const UPLOAD_PATH = path.join(__dirname + '/../uploads')

const multerOptions = {
	storage: multer.diskStorage({
	  destination: UPLOAD_PATH,
	  filename: function (req, file, cb) {
	    cb(null, file.fieldname + '-' + Date.now())
	  }
	}),
	limits: {
		filesize: 1000000
	}
};
//The uploaded file will be at req.file
exports.upload = multer(multerOptions).single('file');

//####### ROUTES #######

//Scrape info from file and use fs-extra to delete entire upload directory beore return info
exports.uploadFile = async (req, res) => {
	if(req.file) {
		const fileInfo = {
			type: req.file.mimetype,
			size: req.file.size,
			name: req.file.originalname
		}
		await fse.remove(UPLOAD_PATH, err => {
			if(err) console.log(err);
		})
		res.json(fileInfo)
	}
	else {
		res.json({error: 'No file uploaded'})
	}
}

exports.uploadPage = (req, res) => {
	res.sendFile(path.join(__dirname + '/../views/fileupload/index.html'));
}