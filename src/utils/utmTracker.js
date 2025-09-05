// UTM Parameter Tracking System
// Captures utm_campaign, utm_source, utm_medium, and gclid from URL query strings
// Stores them in sessionStorage and provides them for form submissions

(function() {
  'use strict';
  
  // Function to sanitize parameter values for security
  function sanitizeValue(value) {
    if (typeof value !== 'string') return '';
    // Remove potentially dangerous characters and limit length
    return value.replace(/[<>'"&]/g, '').substring(0, 200);
  }
  
  // Function to capture and store UTM parameters
  function captureUtmParameters() {
    const utmParams = ['utm_campaign', 'utm_source', 'utm_medium', 'gclid'];
    let currentUtms = {};
    let foundInUrl = false;
    
    try {
      // Try to get UTMs from current URL
      const urlParams = new URLSearchParams(window.location.search);
      
      utmParams.forEach(param => {
        if (urlParams.has(param)) {
          const value = sanitizeValue(urlParams.get(param));
          if (value) {
            currentUtms[param] = value;
            foundInUrl = true;
          }
        }
      });
      
      // If no UTMs found in URL, try to retrieve from sessionStorage
      if (!foundInUrl) {
        const storedUtms = sessionStorage.getItem('utm_parameters');
        if (storedUtms) {
          try {
            currentUtms = JSON.parse(storedUtms);
          } catch (e) {
            console.warn('Failed to parse stored UTM parameters:', e);
            currentUtms = {};
          }
        }
      }
      
      // Store/update UTMs in sessionStorage
      if (Object.keys(currentUtms).length > 0) {
        sessionStorage.setItem('utm_parameters', JSON.stringify(currentUtms));
        console.log('UTM parameters captured:', currentUtms);
      }
    } catch (error) {
      console.warn('Error capturing UTM parameters:', error);
    }
  }
  
  // Initialize on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', captureUtmParameters);
  } else {
    captureUtmParameters();
  }
})();

// Function to retrieve stored UTMs for form submissions
window.getStoredUtmParameters = function() {
  try {
    const storedUtms = sessionStorage.getItem('utm_parameters');
    return storedUtms ? JSON.parse(storedUtms) : {};
  } catch (error) {
    console.warn('Error retrieving UTM parameters:', error);
    return {};
  }
};
