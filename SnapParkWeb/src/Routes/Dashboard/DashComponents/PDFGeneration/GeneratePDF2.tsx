import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { renderToString } from "react-dom/server";
import { Canvg } from "canvg";
import { jsPDF } from "jspdf";
import instructions from "../../../assets/Instructions2.pdf";
import Instructions4 from "../../../../assets/Instructions4.png";
import { mergePdfs } from "./MergePDF";
import QRViewLogo from "../../../../assets/Asset5.png";
import StickerDesignMedium from "../../../../assets/StickerMedium_rev2.png";
import AllSpotsSticker from "../../../../assets/AllSpotsSticker_rev2.png";

import "./Inter/Inter-Bold-bold.js";
import "./Montserrat/Montserrat-Black-bold.js";
import "./Montserrat/Montserrat-Light-normal.js";

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

export const generatePDF2 = async (
  qrArray: ArrayItem[],
  allSpotsURL: string,
) => {
  const pdf = new jsPDF("p", "mm", "a4"); // Create a new A4 PDF document
  if (jsPDF.API.callAddFont) {
    jsPDF.API.callAddFont.call(pdf); // Call the function to add the font to this PDF instance
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  console.log(pageWidth, pageHeight);

  // Adding the instructions image
  const instructionsImage = Instructions4;
  pdf.addImage(instructionsImage, "PNG", 0, 0, pageWidth, pageHeight);

  // New page for the single QR Code for allSpotsURL
  //   pdf.addPage(); // New page for the single QR Code for allSpotsURL
  const allSpotsSvg = <QRCodeSVG value={allSpotsURL} level={"H"} size={500} />;
  const allSpotsSvgString = renderToString(allSpotsSvg);
  const allSpotsDataUri = await svgToDataUri(allSpotsSvgString, 500, 500);

  if (allSpotsDataUri) {
    pdf.addPage();
    const originalAllWidth = 1465;
    const originalAllHeight = 2363;

    const allStickerHeight = 180;

    const allAspectRatio = originalAllWidth / originalAllHeight;

    // Use the aspect ratio to calculate the new width while maintaining the aspect ratio
    const allStickerWidth = allStickerHeight * allAspectRatio;

    const xPosCenter = (pageWidth - allStickerWidth) / 2;
    const yPosCenter = (pageHeight - allStickerHeight) / 2 - 20;

    pdf.addImage(
      AllSpotsSticker,
      "PNG",
      xPosCenter,
      yPosCenter,
      allStickerWidth,
      allStickerHeight,
    );

    const centerQrSize = 80;
    const centerXPosition = xPosCenter + allStickerWidth / 2 - centerQrSize / 2; // Start from the left padding plus QR padding
    const centerYPosition =
      yPosCenter + allStickerHeight / 2 - centerQrSize / 2 + 16;

    pdf.addImage(
      allSpotsDataUri,
      "PNG",
      centerXPosition,
      centerYPosition,
      centerQrSize,
      centerQrSize,
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

  const marginX = 10; // 8mm left and right margin
  const marginY = 13; // 11mm top and bottom margin

  const spacing = 2; // 5mm space between stickers

  const originalWidth = 733;
  const originalHeight = 1052;

  // Desired width or height for the PDF. Let's say we are setting the height.
  const stickerHeight = 88; // This is the desired height in mm for the sticker on the PDF.

  // Calculate the aspect ratio of the original image
  const aspectRatio = originalWidth / originalHeight;

  // Use the aspect ratio to calculate the new width while maintaining the aspect ratio
  const stickerWidth = stickerHeight * aspectRatio;

  let xPosition = marginX;
  let yPosition = marginY;

  let itemIndex = 1;

  for (const item of qrArray) {
    // Check for page overflow and add a new page if necessary
    if (yPosition + stickerHeight > pageHeight - marginY) {
      pdf.addPage();
      xPosition = marginX;
      yPosition = marginY;
    }

    // Add the logo image with the new dimensions
    pdf.addImage(
      StickerDesignMedium,
      "PNG",
      xPosition,
      yPosition,
      stickerWidth,
      stickerHeight,
    );

    const qrSize = 42;

    // QR code positions, accounting for the logo, its padding, and additional padding for the rectangle
    const qrXPosition = xPosition + stickerWidth / 2 - qrSize / 2; // Start from the left padding plus QR padding
    const qrYPosition = yPosition + stickerHeight / 2 - qrSize / 2 - 3.75;

    // Generate and add the QR code
    const svgString = renderToString(
      <QRCodeSVG value={item.url} level={"H"} size={500} />,
    );
    const dataUri = await svgToDataUri(svgString, 500, 500);
    pdf.addImage(dataUri, "PNG", qrXPosition, qrYPosition, qrSize, qrSize);

    pdf.setFont("Montserrat-Light", "normal");
    pdf.setFontSize(10); // Font size for the label
    pdf.setCharSpace(0.5);
    const indexString = `${itemIndex}/${qrArray.length}`; // e.g., "1/8"
    const numberXPosition =
      xPosition + stickerWidth - 12 - (qrArray.length >= 10 ? 1 : 0);
    const numberYPosition = yPosition + 10.5;

    pdf.text(indexString, numberXPosition, numberYPosition, {
      align: "center",
    });
    // Add the label below the QR code
    pdf.setFont("Montserrat-Black", "bold");
    pdf.setFontSize(12.5); // Font size for the label
    pdf.setCharSpace(0.1);
    const labelXPosition = xPosition + stickerWidth - 10 - item.label.length; // Position the label below the QR code with a gap
    const labelYPosition = yPosition + stickerHeight - 6.75; // Position the label below the QR code with a gap

    pdf.text(item.label, labelXPosition, labelYPosition, {
      align: "center",
    });

    // Calculate the label's rectangle dimensions and position

    // Move to the next sticker position, accounting for the width and spacing
    xPosition += stickerWidth + spacing;
    const effectivePageWidth = pageWidth - 2 * marginX;
    itemIndex++;

    // Check if the next sticker would exceed the page width
    if (xPosition + stickerWidth > effectivePageWidth + marginX) {
      // Reset to the first column for a new row
      xPosition = marginX + 0.5;
      // Move down to the next row, including spacing
      yPosition += stickerHeight + spacing;
    }
  }
  pdf.setProperties({ title: "QRStickers" });

  // Save the PDF

  pdf.save("QRStickers.pdf");
  // pdf.output("dataurlnewwindow");
};
