const handleLink = ({ link }) => {
  NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(link));
};

module.exports = { handleLink };
