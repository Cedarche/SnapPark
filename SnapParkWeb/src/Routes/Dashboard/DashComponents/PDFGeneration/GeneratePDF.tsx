import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { renderToString } from "react-dom/server";
import { Canvg } from "canvg";
import { jsPDF } from "jspdf";
import instructions from "../../../assets/Instructions2.pdf";
import Instructions3 from "../../../../assets/Instructions3.png";
import { mergePdfs } from "./MergePDF";
import QRViewLogo from "../../../../assets/Asset5.png";
import "./Inter/Inter-Bold-bold.js";

const svgToDataUri = async (
  svgString: string,
  width: number,
  height: number,
) => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = width; // Set the canvas width
    canvas.height = height; // Set the canvas height
    const context = canvas.getContext("2d");
    if (context) {
      const v = Canvg.fromString(context, svgString.trim());
      await v.render();
      const dataUri = canvas.toDataURL("image/png"); // Use PNG format
      return dataUri;
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return "";
  }
};

interface ArrayItem {
  id: number;
  label: string;
  url: string;
}

export const generatePDF = async (
  qrArray: ArrayItem[],
  allSpotsURL: string,
) => {
  const pdf = new jsPDF("p", "mm", "a4"); // Create a new A4 PDF document
  if (jsPDF.API.callAddFont) {
    jsPDF.API.callAddFont.call(pdf); // Call the function to add the font to this PDF instance
  }

  // Now you can set the font to the custom font you added
  pdf.setFont("Inter-Bold", "bold");
  // Inter-SemiBold

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  console.log(pageWidth, pageHeight);

  // Adding the instructions image
  const instructionsImage = Instructions3;
  pdf.addImage(instructionsImage, "PNG", 0, 0, pageWidth, pageHeight);

  // New page for the single QR Code for allSpotsURL
  pdf.addPage(); // New page for the single QR Code for allSpotsURL

  // Generate the single QR Code
  const allSpotsSvg = <QRCodeSVG value={allSpotsURL} level={"H"} size={500} />;
  const allSpotsSvgString = renderToString(allSpotsSvg);
  const allSpotsDataUri = await svgToDataUri(allSpotsSvgString, 500, 500);

  // Assuming a standard QR code size for the center QR code
  const centerQrSize = 80; // Size of the QR code in mm
  const allBorderRadius = 5; // Border radius for the rounded rectangle
  const allBborderPadding = 10; // Padding around the QR code and label within the border

  // Calculating the position to center the QR code
  const xPosCenter = (pageWidth - centerQrSize) / 2;
  const yPosCenter = (pageHeight - centerQrSize) / 2 - 20; // Adjusted for space for the label

  const logoOriginalWidth = 431;
  const logoOriginalHeight = 122;
  const logoDesiredHeight = 7; // Set the logo height to 12mm
  const logoPadding = 3;
  const allBorderPadding = 10;

  if (allSpotsDataUri) {
    pdf.addImage(
      allSpotsDataUri,
      "PNG",
      xPosCenter,
      yPosCenter,
      centerQrSize,
      centerQrSize,
    );

    // Add the label below the QR code
    pdf.setFontSize(14); // Set the font size for the label
    const label = "All Parking Spots";
    const labelTextWidth = pdf.getTextWidth(label);
    const labelXPos = (pageWidth - labelTextWidth) / 2; // Center the label
    const labelYPos = yPosCenter + centerQrSize + 12; // Position below the QR code
    pdf.text(label, labelXPos, labelYPos);

    // Calculate logo dimensions and position
    const logoDesiredHeight = 10; // Set the logo height
    const logoNewWidth =
      (logoDesiredHeight / logoOriginalHeight) * logoOriginalWidth;
    const logoXPosition = (pageWidth - logoNewWidth) / 2; // Center the logo horizontally
    const logoYPosition = yPosCenter - logoDesiredHeight - 10; // Position the logo above the QR code with some spacing

    // Add the logo image with the new dimensions
    pdf.addImage(
      QRViewLogo,
      "PNG",
      logoXPosition,
      logoYPosition,
      logoNewWidth,
      logoDesiredHeight,
    );

    // Draw a rounded rectangle around the logo
    const logoRectPadding = 5; // Padding around the logo inside the rectangle
    drawRoundedRect(
      pdf,
      xPosCenter -1.5,
      logoYPosition - logoRectPadding,
      centerQrSize + 3,
      logoDesiredHeight + 2 * logoRectPadding,
      2, // Corner radius
      "#c3c3c3", // Color of the rectangle around the logo
    );

    // Draw a rounded rectangle around the QR code and label
    const totalHeight = labelYPos - logoYPosition + logoRectPadding + 18; // Total height from the top of the logo rectangle to the bottom of the label
    drawRoundedRect(
      pdf,
      xPosCenter - 10,
      logoYPosition - logoRectPadding - allBorderPadding + 3,
      centerQrSize + 2 * allBorderPadding,
      totalHeight,
      allBorderRadius,
      "#FF6A00",
    );
  }

  // Continue with your existing logic for qrArray
  if (qrArray.length > 0) {
    pdf.addPage(); // Add a new page for QR codes from qrArray
  }

  // Check for any null or undefined items
  const invalidItems = qrArray.filter(
    (item) => !item || !item.id || !item.label || !item.url,
  );
  if (invalidItems.length) {
    console.error("Invalid items found in the array: ", invalidItems);
    return;
  }

  const marginX = 7; // 8mm left and right margin
  const marginY = 9.5; // 11mm top and bottom margin
  const stickerWidth = 62; // Sticker width: 62mm
  const stickerHeight = 89; // Sticker height: 89mm
  const spacing = 5; // 5mm space between stickers

  let xPosition = marginX;
  let yPosition = marginY;

  const borderColor = "#e3e3e3";

  for (const item of qrArray) {
    // Check for page overflow and add a new page if necessary
    if (yPosition + stickerHeight > pageHeight - marginY) {
      pdf.addPage();
      xPosition = marginX;
      yPosition = marginY;
    }

    const padding = 7; // Padding around the content inside each sticker
    // const logoSize = 10; // Logo dimensions: 12mm x 12mm

    // Calculate the new width while maintaining the aspect ratio
    const logoNewWidth =
      (logoDesiredHeight / logoOriginalHeight) * logoOriginalWidth;

    // Position the logo at the top with padding, centered horizontally
    const logoXPosition = xPosition + (stickerWidth - logoNewWidth) / 2; // Center the logo horizontally within the sticker
    const logoYPosition = yPosition + padding + 1; // Place the logo at the top with padding

    // Add the logo image with the new dimensions
    pdf.addImage(
      QRViewLogo,
      "PNG",
      logoXPosition,
      logoYPosition,
      logoNewWidth,
      logoDesiredHeight,
    );

    // Adjusted QR code size to fit within the remaining space of the sticker
    const qrPadding = 2; // Padding around the QR code within the rectangle
    const newqrSize = stickerWidth - 2 * (padding + qrPadding); // Reduce QR code size to account for padding around it
    const qrSize = stickerWidth - 2 * padding;
    // QR code positions, accounting for the logo, its padding, and additional padding for the rectangle
    const qrXPosition = xPosition + padding + qrPadding; // Start from the left padding plus QR padding
    const qrYPosition =
      logoYPosition + logoDesiredHeight + logoPadding + qrPadding + 2.5; // Position the QR code below the logo with additional padding for the rectangle

    // Generate and add the QR code
    const svgString = renderToString(
      <QRCodeSVG value={item.url} level={"H"} size={500} />,
    );
    const dataUri = await svgToDataUri(svgString, 500, 500);
    pdf.addImage(
      dataUri,
      "PNG",
      qrXPosition,
      qrYPosition,
      newqrSize,
      newqrSize,
    );

    // Rectangle around the QR code with 3mm padding
    const qrRectWidth = qrSize + 4; // Rectangle width includes QR code width plus padding on both sides
    const qrRectHeight = qrSize + 4; // Rectangle height includes QR code height plus padding on both sides
    const qrRectX = qrXPosition - qrPadding - 2; // Rectangle X position is QR code X position minus padding
    const qrRectY = qrYPosition - qrPadding - 2; // Rectangle Y position is QR code Y position minus padding

    drawRoundedRect(
      pdf,
      qrRectX,
      qrRectY,
      qrRectWidth,
      qrRectHeight,
      2, // Corner radius for the rectangle
      borderColor, // Color for the QR code's rectangle
    );

    // Add the label below the QR code
    pdf.setFontSize(12); // Font size for the label
    const labelYPosition = qrYPosition + qrSize + 8.5; // Position the label below the QR code with a gap
    pdf.text(item.label, xPosition + stickerWidth / 2, labelYPosition, {
      align: "center",
    });

    // Calculate the label's rectangle dimensions and position

    // Logo rounded rectangle parameters
    const logoRectX = xPosition - 2 + (stickerWidth - qrSize) / 2; // Center the rectangle horizontally within the sticker, same as QR code width
    const logoRectY = logoYPosition - logoPadding; // Same as logo's Y position
    const logoRectWidth = qrSize + 4; // Same width as QR code
    const logoRectHeight = logoDesiredHeight + 2 * logoPadding; // Logo height plus a small margin
    const labelRectHeight = 8.5; // Assuming a height for the rectangle around the label
    const labelPadding = 2; // Padding around the label text within the rectangle
    const labelRectY = labelYPosition - labelPadding - 5.8; // Position above the label text, considering the font size and padding
    const labelRectX = logoRectX; // Align with the logo's rectangle
    const labelRectWidth = logoRectWidth; // Same width as the logo's rectangle

    // Draw a rounded rectangle around the label
    drawRoundedRect(
      pdf,
      labelRectX,
      labelRectY,
      labelRectWidth,
      labelRectHeight + 2 * labelPadding, // Add padding to the height
      2, // Corner radius
      borderColor, // Color for the label's rectangle
    );
    // Draw a rounded rectangle around the logo
    drawRoundedRect(
      pdf,
      logoRectX,
      logoRectY,
      logoRectWidth,
      logoRectHeight,
      2, // Corner radius
      borderColor, // Example color in valid hexadecimal format
    );

    // Draw a border around the sticker
    drawRoundedRect(
      pdf,
      xPosition,
      yPosition,
      stickerWidth,
      stickerHeight,
      2,
      "#FF6A00",
    );

    // Move to the next sticker position, accounting for the width and spacing
    xPosition += stickerWidth + spacing;
    const effectivePageWidth = pageWidth - 2 * marginX;

    // Check if the next sticker would exceed the page width
    if (xPosition + stickerWidth > effectivePageWidth + marginX) {
      // Reset to the first column for a new row
      xPosition = marginX;
      // Move down to the next row, including spacing
      yPosition += stickerHeight + spacing;
    }
  }
  pdf.setProperties({ title: "QRStickers" });
  // const dynamicPdfArrayBuffer = pdf.output("arraybuffer");

  // // Call the function to merge this dynamic PDF with the Instructions PDF
  // createAndMergePDFs(dynamicPdfArrayBuffer);

  // Save the PDF

  pdf.save("QRStickers.pdf");
  // pdf.output("dataurlnewwindow");
};

// Function to draw a rounded rectangle
function drawRoundedRect(
  pdf: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
  fillColor?: string, // Optional fill color
) {
  // Validate the color format before setting it
  const isValidColor =
    /^#([0-9A-F]{3}){1,2}$/i.test(color) || /^\d{1,3}$/.test(color);
  if (!isValidColor) {
    console.error("Invalid color format:", color);
    return; // Skip drawing if the color is invalid
  }

  if (fillColor) {
    const isValidFillColor =
      /^#([0-9A-F]{3}){1,2}$/i.test(fillColor) || /^\d{1,3}$/.test(fillColor);
    if (!isValidFillColor) {
      console.error("Invalid fill color format:", fillColor);
      return; // Skip filling if the color is invalid
    }
    pdf.setFillColor(fillColor);
  }
  // Draw the outer orange rectangle
  pdf.setDrawColor("white"); // Set the color to orange
  pdf.roundedRect(x, y, width, height, radius, radius, "S");

  // Calculate the inner rectangle parameters
  const innerMargin = 1; // The margin between the outer and inner rectangles
  const innerX = x + innerMargin; // Start 2mm inside on the x-axis
  const innerY = y + innerMargin; // Start 2mm inside on the y-axis
  const innerWidth = width - 2 * innerMargin; // Reduce width by 2mm on each side
  const innerHeight = height - 2 * innerMargin; // Reduce height by 2mm on each side

  // Draw the inner blue rectangle
  // pdf.setDrawColor("#ff6a00"); // Set the color to blue
  // pdf.setDrawColor("#4F46E5"); // Set the color to blue
  pdf.setDrawColor(color); // Set the color to blue
  pdf.roundedRect(innerX, innerY, innerWidth, innerHeight, radius, radius, "S");

  if (fillColor) {
    pdf.rect(x, y, width, height, "F");
  }
}

const blobToArrayBuffer = (blob: any) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

// const fetchPdfArrayBuffer = async (url: any) => {
//   const response = await fetch(url);
//   return response.arrayBuffer();
// };

// pdf.setFont("iter", "bold");

// pdf.output('dataurlnewwindow',);
// pdf.setProperties({ title: 'test' })
async function fetchPdfArrayBuffer(pdfPath: any) {
  const response = await fetch(pdfPath);
  if (!response.ok) throw new Error("Failed to fetch the PDF file");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

async function createAndMergePDFs(dynamicPdfArrayBuffer: any) {
  try {
    // Fetch and convert the Instructions.pdf to ArrayBuffer
    const instructionsArrayBuffer = await fetchPdfArrayBuffer(
      "../../../assets/Instructions2.pdf",
    );

    // Merge the dynamic PDF with the Instructions PDF
    const mergedPdfArrayBuffer = await mergePdfs([
      dynamicPdfArrayBuffer,
      instructionsArrayBuffer,
    ]);

    // Handle the merged PDF ArrayBuffer as needed (e.g., download, preview)
    // For example, to create a Blob for download:
    const blob = new Blob([mergedPdfArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (error) {
    console.error("Error merging PDFs: ", error);
  }
}
