const fs = require('fs');
const path = require('path');

// Move files from one directory to another, if name conflicts occur, overwrite the existing file
function moveFiles(sourceDir, targetDir) {
  try {
    // Get a list of all files in the source directory
    const files = fs.readdirSync(sourceDir);
    // Loop through each file and move it to the target directory
    files.forEach((file) => {
      const sourceFilePath = path.join(sourceDir, file);
      const targetFilePath = path.join(targetDir, file);
      try {
        // Check if the file already exists in the target directory
        if (fs.existsSync(targetFilePath)) {
          // If it does, remove the existing file before moving
          fs.unlinkSync(targetFilePath);
        }
        // Move the file to the target directory
        fs.renameSync(sourceFilePath, targetFilePath);
        console.log(`Moved ${file} to ${targetDir}`);
      } catch (error) {
        console.error(`Error moving ${file}: ${error.message}`);
      }
    });
  } catch (error) {
    console.error(`Error reading source directory: ${error.message}`);
  }
}

// Example usage:
const sourceDirectory = 'omnidocs/images'; // Change this to your source directory
const targetDirectory = '../static/images'; // Change this to your target directory

moveFiles(sourceDirectory, targetDirectory);
