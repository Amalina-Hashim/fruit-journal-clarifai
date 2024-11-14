import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCameraRotate } from "@fortawesome/free-solid-svg-icons";
import Webcam from "react-webcam";
import { uploadImageToCloudinary } from "../utils/cloudinaryUtils";

function Webcamcomponent(props) {
  const webcamRef = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [imageLabels, setImageLabels] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState("");
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const toggleCamera = (event) => {
    event.preventDefault();
    setIsFrontCamera((prev) => !prev);
    getVideo();
  };

  const getVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isFrontCamera ? "user" : "environment" },
      });
      let video = webcamRef.current.video;
      video.srcObject = stream;
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const takePhoto = async (event) => {
    event.preventDefault();
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setHasPhoto(true);

    try {
      // Upload image to Cloudinary
      const uploadResponse = await uploadImageToCloudinary(imageSrc);
      const uploadedUrl = uploadResponse?.secure_url;

      if (uploadedUrl) {
        console.log("Cloudinary uploaded image URL:", uploadedUrl); // Log the uploaded URL
        setCloudinaryUrl(uploadedUrl);
        props.onCapture(imageSrc, uploadedUrl);
        props.onCloudinaryUrlUpdate(uploadedUrl);

        // Analyze the image using Clarifai with the Cloudinary URL
        await analyzeImageWithClarifai(uploadedUrl);
      } else {
        console.error("Uploaded URL is undefined");
      }
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
    }
  };

  // Analyze the uploaded image using the Clarifai API through the serverless function
  const analyzeImageWithClarifai = async (uploadedUrl) => {
    try {
      if (!uploadedUrl) {
        console.error("Clarifai analysis skipped: uploadedUrl is undefined");
        return;
      }

      const clarifaiResponse = await sendClarifaiRequest(uploadedUrl);
      const predictions = clarifaiResponse.outputs[0]?.data?.concepts || [];

      // Filter predictions with confidence score >= 0.95
      const filteredPredictions = predictions.filter(
        (prediction) => prediction.value >= 0.95
      );

      // Format the predictions for display
      const formattedLabels = filteredPredictions.map((prediction) => ({
        classNames: [prediction.name],
      }));

      setImageLabels(formattedLabels);
    } catch (error) {
      console.error("Error analyzing image with Clarifai:", error);
    }
  };

  // Send request to the Clarifai API via serverless function
  const sendClarifaiRequest = async (uploadedUrl) => {
    if (!uploadedUrl) {
      throw new Error(
        "Invalid image URL. Please check the image upload process."
      );
    }

    const requestData = {
      user_app_id: {
        user_id: "clarifai",
        app_id: "main",
      },
      inputs: [
        {
          id: "image-input",
          data: {
            image: {
              url: uploadedUrl,
              allow_duplicate_url: true, 
            },
          },
        },
      ],
    };

    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Key YOUR_CLARIFAI_API_KEY`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };

    try {
      console.log("Sending request to Clarifai with image URL:", uploadedUrl);
      const response = await fetch(
        "https://api.clarifai.com/v2/models/aa7f35c01e0642fda5cf400f543e7c40/outputs",
        requestOptions
      );
      const data = await response.json();

      // Log the full response for debugging
      console.log("Clarifai API Response:", data);

      if (!response.ok) {
        throw new Error(`Clarifai API Error: ${data.status.description}`);
      }

      return data;
    } catch (error) {
      console.error("Error analyzing image with Clarifai:", error);
      throw new Error(error.message);
    }
  };

  const handleLabelClick = (className) => {
    props.onLabelSelect(className);
    setImageLabels((prevLabels) =>
      prevLabels.filter((label) => !label.classNames.includes(className))
    );
  };

  const deletePhoto = () => {
    setHasPhoto(false);
    setCapturedImage(null);
    setImageLabels([]);
  };

  const resetCamera = () => {
    setHasPhoto(false);
    setCapturedImage(null);
    setImageLabels([]);
  };

  useEffect(() => {
    if (props.visible === false) {
      resetCamera();
    }
  }, [props.visible]);

  useEffect(() => {
    const photoButton = document.getElementById("photoButton");
    if (photoButton) {
      photoButton.addEventListener("click", takePhoto);
    }

    return () => {
      if (photoButton) {
        photoButton.removeEventListener("click", takePhoto);
      }
    };
  }, [takePhoto]);

  return (
    <div className="webcamContainer">
      <div className="webcam">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/png"
          videoConstraints={{
            facingMode: isFrontCamera ? "user" : "environment",
          }}
        />
        <button id="photoButton" className="snap" onClick={takePhoto}>
          Snap
        </button>
        <button className="flipCamera" onClick={toggleCamera}>
          <FontAwesomeIcon icon={faCameraRotate} style={{ color: "#feffff" }} />
        </button>
      </div>
      <div className={"result " + (hasPhoto ? "hasPhoto" : "")}>
        {hasPhoto && (
          <>
            <img
              className="captured-photo"
              src={capturedImage}
              alt="Captured"
              style={{ width: "100%" }}
            />
            <button className="delete" onClick={deletePhoto}>
              Delete
            </button>
            <div className="labels">
              <h3>Looks like you're having:</h3>
              <ul>
                {imageLabels.map((label, labelIndex) =>
                  label.classNames.map((className, classNameIndex) => (
                    <li
                      className="list"
                      key={`${labelIndex}-${classNameIndex}`}
                      onClick={() => handleLabelClick(className)}
                    >
                      {className}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Webcamcomponent;
