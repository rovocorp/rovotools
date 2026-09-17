// The real screens import react-native/expo native modules that Jest cannot
// parse (node_modules are not transformed). This suite only exercises the
// slug lookup, so stub the screens and test the registry mapping instead.
jest.mock('../pdf/MergePdf', () => ({ __esModule: true, default: () => null }));
jest.mock('../pdf/SplitPdf', () => ({ __esModule: true, default: () => null }));
jest.mock('../pdf/CompressPdf', () => ({ __esModule: true, default: () => null }));
jest.mock('../pdf/JpgToPdf', () => ({ __esModule: true, default: () => null }));
jest.mock('../pdf/PdfToJpg', () => ({ __esModule: true, default: () => null }));
jest.mock('../pdf/WordToPdf', () => ({ __esModule: true, default: () => null }));
jest.mock('../pdf/PdfCreator', () => ({ __esModule: true, default: () => null }));
jest.mock('../pdf/SignPdf', () => ({ __esModule: true, default: () => null }));
jest.mock('../pdf/PdfToWord', () => ({ __esModule: true, default: () => null }));
jest.mock('../pdf/PdfToExcel', () => ({ __esModule: true, default: () => null }));

import { getCustomMobileToolComponent } from '../customTools';

describe('customTools', () => {
  it('falls back to the generic runner for engine-driven tools', () => {
    expect(getCustomMobileToolComponent('json-formatter')).toBeUndefined();
    expect(getCustomMobileToolComponent('code-minifier')).toBeUndefined();
    expect(getCustomMobileToolComponent('no-such-tool')).toBeUndefined();
  });

  it('resolves every custom PDF tool to its screen', () => {
    for (const slug of [
      'merge-pdf',
      'split-pdf',
      'compress-pdf',
      'jpg-to-pdf',
      'pdf-to-jpg',
      'word-to-pdf',
      'pdf-creator',
      'sign-pdf',
      'pdf-to-word',
      'pdf-to-excel',
    ]) {
      expect(getCustomMobileToolComponent(slug)).toBeDefined();
    }
  });
});
