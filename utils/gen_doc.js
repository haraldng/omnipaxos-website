// Require the js-yaml library
const yaml = require('js-yaml');
const fs = require('fs'); // Required for reading the file
const path = require('path');

OmniPaxosDocBasePath = 'utils/omnidocs'
EnDocPath = 'content/en/docs'

DocIndex = 0
// Sample YAML data
const yamlData = fs.readFileSync(`${OmniPaxosDocBasePath}/structure.yml`, 'utf8');
// Parse YAML data into JSON
const jsonData = yaml.load(yamlData);
console.log(JSON.stringify(jsonData, null, 2));

genDocs(jsonData, EnDocPath)

function genDocs(fileStructure, basePath) {
  deleteDirectory(basePath);
  fs.mkdirSync(basePath);
  const indexContent = `---
title : "Docs"
description: "Docs Doks."
lead: ""
date: 2020-10-06T08:48:23+00:00
lastmod: 2020-10-06T08:48:23+00:00
draft: false
images: []
---
`;
  fs.writeFileSync(`${basePath}/_index.md`, indexContent);
  generateFileStructure(jsonData, basePath);
  deleteDirectory(OmniPaxosDocBasePath);
}

function generateFileStructure(fileStructure, basePath) {
  for (const key in fileStructure) {
    //noinspection JSUnfilteredForInLoop
    const section = fileStructure[key];
    //noinspection JSUnfilteredForInLoop
    const sectionPath = `${basePath}/${key}`;
    if (section.hasOwnProperty('path')) {
      DocIndex++;
      // Create file
      //noinspection JSUnfilteredForInLoop
      fs.writeFileSync(`${sectionPath}.md`, genIndexContent(key, DocIndex));
      appendFileContent(`${OmniPaxosDocBasePath}/${section.path}`, `${sectionPath}.md`)
      console.log(`File created: ${sectionPath}     with index ${DocIndex}`);
      DocIndex++;
    } else {
      DocIndex++;
      // Create directory
      fs.mkdirSync(sectionPath);
      //noinspection JSUnfilteredForInLoop
      fs.writeFileSync(`${sectionPath}/_index.md`, genIndexContent(key, DocIndex));
      console.log(`Directory created: ${sectionPath}    with index ${DocIndex}`);
      // Recursively generate file structure inside the directory
      generateFileStructure(section, sectionPath);
      DocIndex++;
    }
  }
}

function genIndexContent(title, weight) {
  return `---
title: \"${title}\"
weight: ${weight}
toc: false
---
`;
}

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const fileStat = fs.statSync(filePath);
      if (fileStat.isDirectory()) {
        deleteDirectory(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });

    fs.rmdirSync(dirPath);
  } else {
  }
}

function appendFileContent(sourceFilePath, targetFilePath) {
  // Read the content of the source file
  fs.readFile(sourceFilePath, 'utf-8', (err, data) => {
    if (err) {
      console.error(`Failed to read source file: ${err}`);
      return;
    }

    // Append the content of the source file to the target file
    fs.appendFile(targetFilePath, data, 'utf-8', (err) => {
      if (err) {
        console.error(`Failed to append content to target file: ${err}`);
      }
    });
  });
}
