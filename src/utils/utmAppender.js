// UTM Parameter Appender for Outbound Links
// Automatically adds utm_campaign=imob&utm_medium=web&utm_source=lp to external links

(function() {
  'use strict';
  
  // UTM parameters to append
  const UTM_PARAMS = {
    utm_campaign: 'imob',
    utm_medium: 'web',
    utm_source: 'lp'
  };
  
  // Function to check if a URL is external (different domain)
  function isExternalLink(url, currentHostname) {
    try {
      const linkUrl = new URL(url, window.location.href);
      return linkUrl.hostname !== currentHostname;
    } catch (e) {
      // If URL parsing fails, assume it's not external
      return false;
    }
  }
  
  // Function to check if link should be excluded from UTM appending
  function shouldExcludeLink(href) {
    if (!href) return true;
    
    // Exclude internal anchors, mailto, tel, and WhatsApp links
    const excludePatterns = [
      /^#/,                    // Internal anchors
      /^mailto:/i,             // Email links
      /^tel:/i,                // Phone links
      /^sms:/i,                // SMS links
      /wa\.me/i,               // WhatsApp links
      /whatsapp/i,             // WhatsApp links
      /javascript:/i           // JavaScript links
    ];
    
    return excludePatterns.some(pattern => pattern.test(href));
  }
  
  // Function to append UTM parameters to a URL
  function appendUtmParameters(url) {
    try {
      const urlObj = new URL(url);
      
      // Add UTM parameters
      Object.entries(UTM_PARAMS).forEach(([key, value]) => {
        // Only add if the parameter doesn't already exist
        if (!urlObj.searchParams.has(key)) {
          urlObj.searchParams.set(key, value);
        }
      });
      
      return urlObj.toString();
    } catch (e) {
      console.warn('Failed to append UTM parameters to URL:', url, e);
      return url;
    }
  }
  
  // Function to process all links on the page
  function processOutboundLinks() {
    const currentHostname = window.location.hostname;
    const links = document.querySelectorAll('a[href]');
    let processedCount = 0;
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Skip if link should be excluded
      if (shouldExcludeLink(href)) {
        return;
      }
      
      // Check if it's an external link
      if (isExternalLink(href, currentHostname)) {
        const updatedHref = appendUtmParameters(href);
        if (updatedHref !== href) {
          link.setAttribute('href', updatedHref);
          processedCount++;
        }
      }
    });
    
    if (processedCount > 0) {
      console.log(`UTM parameters added to ${processedCount} outbound links`);
    }
  }
  
  // Function to observe for dynamically added links
  function observeNewLinks() {
    const observer = new MutationObserver(mutations => {
      let hasNewLinks = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is a link or contains links
              if (node.tagName === 'A' || node.querySelectorAll('a[href]').length > 0) {
                hasNewLinks = true;
              }
            }
          });
        }
      });
      
      if (hasNewLinks) {
        // Small delay to ensure DOM is fully updated
        setTimeout(processOutboundLinks, 100);
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return observer;
  }
  
  // Initialize when DOM is ready
  function initialize() {
    // Process existing links
    processOutboundLinks();
    
    // Set up observer for dynamically added links
    observeNewLinks();
  }
  
  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also run after a short delay to catch any late-loading content
  setTimeout(processOutboundLinks, 1000);
})();