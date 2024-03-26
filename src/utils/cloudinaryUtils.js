export const uploadImageToCloudinary = async (imageData) => {
    try {
      const cloudinaryCloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME; 
      const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`;
      const cloudinaryApiKey = process.env.REACT_APP_CLOUDINARY_API_KEY; 
      const cloudinaryPreset = process.env.REACT_APP_CLOUDINARY_PRESET_NAME; 
      
      const blobData = await (await fetch(imageData)).blob();
  
      const formData = new FormData();
    formData.append("file", blobData);
    formData.append("upload_preset", cloudinaryPreset);
    formData.append("api_key", cloudinaryApiKey);

    const response = await fetch(cloudinaryUploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error uploading image to Cloudinary");
    }

    const data = await response.json();

    if (data && data.secure_url) {
      const uploadedUrl = data.secure_url;

      return { secure_url: uploadedUrl };
    } else {
      throw new Error("Uploaded image URL not found in response");
    }
  } catch (error) {
    throw new Error("Error uploading image to Cloudinary: " + error.message);
  }
};