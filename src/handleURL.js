export const handleURL = ({ url }) => {
  NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
};
