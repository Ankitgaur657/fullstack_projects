import multer from "multer";


// Configure Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp"); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        
        cb(null, file.originalname);
    }
});

// Multer Upload Middleware
export const upload = multer({ storage });
