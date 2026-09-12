const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function createResumePdf() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const uploadDir = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const outputPath = path.join(uploadDir, 'john-react-resume.pdf');
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    doc.fontSize(24).text('John Doe', { align: 'center' });
    doc.fontSize(12).text('john.doe@example.com | +1-555-0199', { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text('Professional Summary');
    doc.fontSize(10).text('Experienced Frontend Developer with over 5 years of experience building modern web applications.');
    doc.moveDown();

    doc.fontSize(16).text('Skills');
    doc.fontSize(10).text('React, JavaScript, CSS, Node.js, Express, MongoDB, Git');
    doc.moveDown();

    doc.fontSize(16).text('Experience');
    doc.fontSize(10).text('Frontend Developer at TechSolutions (2021 - Present)\n- Developed rich, interactive user interfaces using React and state management libraries.\n- Wrote semantic, responsive styling using CSS and Tailwind.');
    doc.moveDown();

    doc.fontSize(16).text('Education');
    doc.fontSize(10).text('B.Tech in Computer Science - State University (2017 - 2021)');

    doc.end();

    writeStream.on('finish', () => {
      console.log(`Successfully created test resume PDF at: ${outputPath}`);
      resolve(outputPath);
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { createResumePdf };

// Run if called directly
if (require.main === module) {
  createResumePdf();
}
