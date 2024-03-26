import React, { useState, useEffect } from "react";
import LocationDisplay from "./Location";
import Webcamcomponent from "./Webcam";

function CreateArea(props) {
  const [note, setNote] = useState({ title: "", content: [] });
  const [capturedImage, setCapturedImage] = useState("");
  const [timestampSet, setTimestampSet] = useState(false);
  const [locationData, setLocationData] = useState("");
  const [locationName, setLocationName] = useState("");
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [cloudinaryUrl, setCloudinaryUrl] = useState("");

  function formatDate() {
    const now = new Date();
    const options = {
      weekday: "long",
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return now.toLocaleString("en-US", options);
  }

  const handleLocationUpdate = (data) => {
    setLocationData(data);
    setLocationName(data);
  };

  const handleLabelSelect = (selectedLabel) => {
    const updatedSelectedLabels = [...selectedLabels, selectedLabel];
    setSelectedLabels(updatedSelectedLabels);
  };

  const handleRemoveLabel = (removedLabel) => {
    const updatedSelectedLabels = selectedLabels.filter(
      (label) => label !== removedLabel
    );
    setSelectedLabels(updatedSelectedLabels);
  };

  const handleCloudinaryUrlUpdate = (uploadedUrl) => {
    setCloudinaryUrl(uploadedUrl);
  };

  useEffect(() => {
  }, [cloudinaryUrl]); 

  useEffect(() => {
    if (!props.modalOpen) {
      setNote((prevNote) => ({ ...prevNote, content: [] }));
      setSelectedLabels([]);
    }
  }, [props.modalOpen]);

  useEffect(() => {
    if (!timestampSet) {
      setNote((prevNote) => ({ ...prevNote, title: formatDate() }));
      setTimestampSet(true);
    }
    const intervalId = setInterval(() => {
      setNote((prevNote) => ({ ...prevNote, title: formatDate() }));
    }, 60000);
    return () => clearInterval(intervalId);
  }, [timestampSet]);

  useEffect(() => {
    if (props.reset) {
      setNote({ title: formatDate(), content: [] });
      setCapturedImage("");
      setCloudinaryUrl("");
      setTimestampSet(false);
      props.onReset();
    }
  }, [props.reset]);

  async function submitNote(event) {
    event.preventDefault();
    const contentString =
      typeof note.content === "string" ? note.content : note.content.toString();
    const labelsArray = Array.isArray(selectedLabels) ? selectedLabels : [];

    let imageData = null;
    if (capturedImage) {
      imageData = capturedImage instanceof Blob ? capturedImage : null;
    }

    const noteToAdd = {
      title: note.title,
      content: contentString,
      labels: labelsArray.join(","),
      image: imageData,
      cloudUrl: cloudinaryUrl, 
      location: locationData,
    };

    props.onAdd(noteToAdd, cloudinaryUrl);
    setNote({ title: "", content: "" });
    setCapturedImage("");
    setCloudinaryUrl("");
    setSelectedLabels([]);
    props.onModalClose();
  }

  return (
    <div>
      <form>
        <h2>{note.title}</h2>
        <textarea
          name="content"
          onChange={(e) => setNote({ ...note, content: e.target.value })}
          value={note.content}
          placeholder="Description..."
          rows="3"
        />
        <div className="label-list">
          <h2>What Fruits are you having today?</h2>
          <ul>
            {selectedLabels.map((label, index) => (
              <li
                key={index}
                className="label-item"
                onClick={() => handleRemoveLabel(label)}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
        <Webcamcomponent
          onCapture={(imageURL, cloudUrl) => {
            setCapturedImage(imageURL);
            setCloudinaryUrl(cloudUrl);
          }}
          onReset={props.onReset}
          visible={props.visible}
          onLabelSelect={handleLabelSelect}
          onCloudinaryUrlUpdate={handleCloudinaryUrlUpdate}
        />
        <LocationDisplay
          locationName={locationName}
          onLocationUpdate={handleLocationUpdate}
        />
        <button onClick={submitNote} className="form-button">
          Add
        </button>
      </form>
    </div>
  );
}

export default CreateArea;
