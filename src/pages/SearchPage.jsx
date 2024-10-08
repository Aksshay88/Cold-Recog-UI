import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate, Link } from "react-router-dom";
import "../styles/SearchPage.css";
import logo from "../assets/logo.png";
import AnimationComponent from "./AnimationComponent";

const SearchPage = () => {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState("");
  const [matchedImages, setMatchedImages] = useState([]);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setIsFileProcessing(true);
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const matchedImagesData = data.matched_images || [];
          const matchedImagesUrls = matchedImagesData.map((imageData) => ({
            url: `http://localhost:5000/matched-images/${imageData.file_name}`,
            matchRate: imageData.match_rate,
          }));
          setMatchedImages(matchedImagesUrls);
          setUploadCompleted(true);
        } else {
          console.error("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Cleanup URL on component unmount
      return () => {
        URL.revokeObjectURL(preview);
      };
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png, image/jpg",
  });

  const handleSearch = () => {
    navigate("/result", { state: { uploadedImage: previewUrl, matchedImages } });
  };

  useEffect(() => {
    if (previewUrl) {
      setIsFileProcessing(false);
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="search-page">
      <header className="searching-header">
        <img src={logo} alt="Logo" className="headerLogos" />
        <nav className="navLinks">
          <Link to="/">
            <button>About</button>
          </Link>
          <Link to="/">
            <button>Features</button>
          </Link>
          <Link to="/">
            <button>Contact us</button>
          </Link>
        </nav>
      </header>
      <main className="search-main">
        {isFileProcessing ? (
          <div className="loading">
            <AnimationComponent />
          </div>
        ) : uploadCompleted ? (
          <div className="preview-container">
            <img src={previewUrl} alt="Uploaded file preview" />
            <button className="search-button" onClick={handleSearch}>
              GET RESULTS
            </button>
          </div>
        ) : (
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>DRAG & DROP</p>
            )}
          </div>
        )}
      </main>
      <footer className="searching-footer">
        <nav>
          <a href="https://github.com/Hackathon-5XA/Cold-Recog-UI/issues">
            <button>Issues</button>
          </a>
          <a href="https://github.com/Hackathon-5XA">
            <button>Repo</button>
          </a>
          <a href="/">
            <button>Privacy Policy</button>
          </a>
        </nav>
        <h1>CopyRight &copy; 5XA</h1>
      </footer>
    </div>
  );
};

export default SearchPage;
