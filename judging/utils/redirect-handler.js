export function checkMediumRedirect(markdownContent) {
    const redirectMatch = markdownContent.match(/Moved Permanently\. Redirecting to (https?:\/\/\S+)/);
    return redirectMatch ? redirectMatch[1] : null;
  }
  