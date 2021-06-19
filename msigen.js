const MSICreator = require('electron-wix-msi').MSICreator;
const packageJson = require('./package.json');

// Step 1: Instantiate the MSICreator
const msiCreator = new MSICreator({
    appDirectory: 'dist/adfrify-win32-x64/',
    description: packageJson.description,
    exe: 'adfrify-'+packageJson.version+"-installer",
    name: packageJson.productName,
    manufacturer: packageJson.author,
    version: packageJson.version,
    outputDirectory: 'builds/'
});

// Step 2: Create a .wxs template file
msiCreator.create().then(() => {
    msiCreator.compile().then(() => {
        console.log("Done!");
    });
});

// Step 3: Compile the template to a .msi file
