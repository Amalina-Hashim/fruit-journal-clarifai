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
  const [loading, setLoading] = useState(false);

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
      setLoading(true); 
      const uploadResponse = await uploadImageToCloudinary(imageSrc);
      const uploadedUrl = uploadResponse?.secure_url;

      if (uploadedUrl) {
        console.log("Cloudinary uploaded image URL:", uploadedUrl);
        setCloudinaryUrl(uploadedUrl);
        props.onCapture(imageSrc, uploadedUrl);
        props.onCloudinaryUrlUpdate(uploadedUrl);
        await analyzeImageWithClarifai(uploadedUrl);
      } else {
        console.error("Uploaded URL is undefined");
      }
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeImageWithClarifai = async (uploadedUrl) => {
    try {
      if (!uploadedUrl) {
        console.error("Clarifai analysis skipped: uploadedUrl is undefined");
        return;
      }

      const clarifaiResponse = await sendClarifaiRequest(uploadedUrl);
      const predictions = clarifaiResponse.outputs[0]?.data?.concepts || [];

      const filteredPredictions = predictions.filter(
        (prediction) => prediction.value >= 0.95
      );

      const formattedLabels = filteredPredictions.map((prediction) => ({
        classNames: [prediction.name],
      }));

      setImageLabels(formattedLabels);
    } catch (error) {
      console.error("Error analyzing image with Clarifai:", error);
    }
  };

  const sendClarifaiRequest = async (uploadedUrl) => {
    if (!uploadedUrl) {
      throw new Error(
        "Invalid image URL. Please check the image upload process."
      );
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl: uploadedUrl }),
    };

    try {
      console.log(
        "Sending request to Vercel serverless function with image URL:",
        uploadedUrl
      );
      const response = await fetch("/api/clarifai", requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Serverless function error: ${data.error || "Unknown error"}`
        );
      }

      console.log("Response from serverless function:", data);
      return data;
    } catch (error) {
      console.error(
        "Error analyzing image with Clarifai via serverless function:",
        error
      );
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
              {loading ? (
                <p>Processing image...</p>
              ) : (
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
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Webcamcomponent;
