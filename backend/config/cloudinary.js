const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const fs = require("fs");



cloudinary.config({
    cloud_name: "dlcsmlmum",
    api_key: "542816236671575",
    api_secret: "UC29-GY5EwvqpeNqO6R5Fc2w_XI",
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        // console.log("New file path:", localFilePath);
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        console.log("File uploaded to Cloudinary:", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("Error uploading to Cloudinary:", error);
        return null;
    }
}



module.exports = { uploadOnCloudinary, cloudinary };
