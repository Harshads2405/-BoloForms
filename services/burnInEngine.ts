
import { PDFDocument, rgb } from 'pdf-lib';
import { Field, FieldType } from '../types';

/**
 * THE BURN-IN ENGINE (SIMULATED BACKEND LOGIC)
 * 
 * MATH EXPLANATION (For Video Walkthrough):
 * 1. Web View: Uses Top-Left origin. Fields are stored as percentages (0-100) 
 *    relative to the container to ensure responsiveness across devices.
 * 2. PDF View: Uses Bottom-Left origin. Measurements are in Points (1/72 inch).
 * 
 * Conversion Logic:
 * PDF_X = (Field_X_Percent / 100) * PDF_Page_Width
 * PDF_Y = (1 - (Field_Y_Percent + Field_Height_Percent) / 100) * PDF_Page_Height
 * 
 * This ensures that if a box is 10% from the top in the browser, 
 * it correctly maps to 90% from the bottom in the PDF coordinate space.
 */

export async function burnFieldsIntoPdf(
  originalPdfUrl: string,
  fields: Field[]
): Promise<{ blob: Blob; originalHash: string; finalHash: string }> {
  // 1. Load the original document
  const response = await fetch(originalPdfUrl);
  const pdfBytes = await response.arrayBuffer();
  
  // Calculate SHA-256 for Audit Trail (Before)
  const originalHash = await calculateHash(pdfBytes);
  
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  
  for (const field of fields) {
    const pageIndex = (field.page || 1) - 1;
    if (pageIndex >= pages.length) continue;
    
    const page = pages[pageIndex];
    const { width, height } = page.getSize();
    
    // Translated Coordinates
    const x = (field.x / 100) * width;
    const y = (1 - (field.y + field.h) / 100) * height; 
    const w = (field.w / 100) * width;
    const h = (field.h / 100) * height;

    if ((field.type === FieldType.SIGNATURE || field.type === FieldType.IMAGE) && field.value) {
      try {
        const image = field.value.startsWith('data:image/png') 
          ? await pdfDoc.embedPng(field.value) 
          : await pdfDoc.embedJpg(field.value);
        
        // Aspect Ratio Constraint: Contain image within the box (Centered)
        const imgDims = image.scale(1);
        const imgRatio = imgDims.width / imgDims.height;
        const boxRatio = w / h;
        
        let drawW = w;
        let drawH = h;
        let drawX = x;
        let drawY = y;
        
        if (imgRatio > boxRatio) {
          // Image is wider than the box
          drawH = w / imgRatio;
          drawY += (h - drawH) / 2; // Center vertically
        } else {
          // Image is taller than the box
          drawW = h * imgRatio;
          drawX += (w - drawW) / 2; // Center horizontally
        }

        page.drawImage(image, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });
      } catch (e) {
        console.error("Failed to embed image:", e);
      }
    } else if (field.type === FieldType.TEXT || field.type === FieldType.DATE || field.type === FieldType.RADIO) {
      // Dynamic Font Scaling based on box height
      const fontSize = Math.max(8, h * 0.65);
      page.drawText(field.value || ' ', {
        x: x + (w * 0.05), // Small padding
        y: y + (h / 2) - (fontSize / 3), // Centered vertically on baseline
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    }
  }

  // Finalize document
  const finalPdfBytes = await pdfDoc.save();
  
  // Calculate SHA-256 for Audit Trail (After)
  const finalHash = await calculateHash(finalPdfBytes);

  return {
    blob: new Blob([finalPdfBytes], { type: 'application/pdf' }),
    originalHash,
    finalHash
  };
}

/**
 * Security Layer: SHA-256 Hashing for Document Integrity
 */
async function calculateHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
