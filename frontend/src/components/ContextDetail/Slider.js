import React, { useState, useContext } from 'react';
import { HomeFeedContext } from '../../context/HomeFeedContext'; // Assuming context is set up already
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitizing HTML

export default function Slider() {
  const { contexts } = useContext(HomeFeedContext);
  const [currentSlide, setCurrentSlide] = useState(0);  // Keeps track of the current slide

  // Filter contexts that have slides defined
  const slides = contexts.flatMap(context => {
    return [
      context.slide1, context.slide2, context.slide3, context.slide4,
      context.slide5, context.slide6, context.slide7, context.slide8,
      context.slide9, context.slide10
    ].filter(slide => slide && (slide.title || slide.description));  // Only keep slides that have title or description
  });

  // Function to handle navigation to the next slide
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);  // Wrap around when reaching the last slide
  };

  // Function to handle navigation to the previous slide
  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);  // Wrap around when reaching the first slide
  };

  if (slides.length === 0) {
    return <div>No slides available</div>;  // If no slides are available, show this message
  }

  // Sanitize the HTML before rendering it
  const createSanitizedMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <div className="slider">
      <button className="prev-arrow" onClick={prevSlide}>&#10094;</button> {/* Left arrow */}
      
      <div className="slide">
        <h2>{slides[currentSlide]?.title || 'No Title'}</h2>
        <p dangerouslySetInnerHTML={createSanitizedMarkup(slides[currentSlide]?.description || 'No Description')} />
      </div>

      <button className="next-arrow" onClick={nextSlide}>&#10095;</button> {/* Right arrow */}
    </div>
  );
}
