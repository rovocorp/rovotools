import type { ComponentType } from "react";

import MergePdfScreen from "./pdf/MergePdf";
import SplitPdfScreen from "./pdf/SplitPdf";
import CompressPdfScreen from "./pdf/CompressPdf";
import JpgToPdfScreen from "./pdf/JpgToPdf";
import PdfToJpgScreen from "./pdf/PdfToJpg";
import WordToPdfScreen from "./pdf/WordToPdf";
import PdfCreatorScreen from "./pdf/PdfCreator";
import SignPdfScreen from "./pdf/SignPdf";
import PdfToWordScreen from "./pdf/PdfToWord";
import PdfToExcelScreen from "./pdf/PdfToExcel";

const customToolComponents: Record<string, ComponentType> = {
  "merge-pdf": MergePdfScreen,
  "split-pdf": SplitPdfScreen,
  "compress-pdf": CompressPdfScreen,
  "jpg-to-pdf": JpgToPdfScreen,
  "pdf-to-jpg": PdfToJpgScreen,
  "word-to-pdf": WordToPdfScreen,
  "pdf-creator": PdfCreatorScreen,
  "sign-pdf": SignPdfScreen,
  "pdf-to-word": PdfToWordScreen,
  "pdf-to-excel": PdfToExcelScreen,
};

export function getCustomMobileToolComponent(slug: string): ComponentType | undefined {
  return customToolComponents[slug];
}