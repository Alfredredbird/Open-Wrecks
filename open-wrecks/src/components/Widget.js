import React from "react";
import ReactMarkdown from "react-markdown";
import ImageCarousel from "./ImageCarousel"; 
import "./Widget.css"; 

const Widget = ({ title, links = [], description, severity, images = [] }) => {
  const severityClass = severity ? `news-severity news-${severity.toLowerCase()}` : "";

  return (
    <div className="news-card">
      {title && (
        <div className="news-header">
          <h4>{title}</h4>
          {severity && <span className={severityClass}>{severity.toUpperCase()}</span>}
        </div>
      )}
      <div className="news-divider"></div>

      {images.length > 0 && <ImageCarousel images={images} />}

      {description && (
        <div className="news-summary">
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      )}

      {links.length > 0 && (
        <div className="widget-links">
          {links.map((link, i) => (
            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="news-link">
              {link}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Widget;
