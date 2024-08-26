import { PDFDocument, PDFPage } from "pdf-lib";

export async function mergePdfs(pdfsToMerge: ArrayBuffer[]): Promise<ArrayBufferLike> {
  const mergedPdf: PDFDocument = await PDFDocument.create();

  const createInnerPromise = async (arrayBuffer: ArrayBuffer): Promise<PDFPage[]> => {
    const pdf: PDFDocument = await PDFDocument.load(arrayBuffer);
    return await mergedPdf.copyPages(pdf, pdf.getPageIndices());
  };

  const outerPromise: Promise<PDFPage[]>[] = pdfsToMerge.map((arrayBuffer) => {
    const innerPromise: Promise<PDFPage[]> = createInnerPromise(arrayBuffer);
    return innerPromise;
  });

  const resultOuterPromise: PDFPage[][] = await Promise.all(outerPromise);

  resultOuterPromise.forEach((pageArray: PDFPage[]) => {
    pageArray.forEach((page: PDFPage) => {
      mergedPdf.addPage(page);
    });
  });

  return (await mergedPdf.save()).buffer;
}