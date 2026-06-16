import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Receipt upload validation and error handling tests.
 * Tests the receipt file validation logic and Supabase integration.
 */

interface UploadResult {
  success: boolean;
  error?: string;
  publicUrl?: string;
}

/**
 * Validates and uploads a receipt file to Supabase Storage.
 * Returns success/error result.
 */
async function uploadReceipt(
  file: File,
  supabase: any,
): Promise<UploadResult> {
  // Validate file type
  if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
    return { success: false, error: 'Sube una imagen o PDF del comprobante.' };
  }

  if (!supabase) {
    return {
      success: false,
      error: 'La carga de comprobantes no está disponible en este momento. Adjúntalo directamente en WhatsApp.',
    };
  }

  try {
    const fileName = `receipts/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('products').getPublicUrl(fileName);
    return { success: true, publicUrl: data.publicUrl };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'No se pudo subir el comprobante.';
    return { success: false, error: message };
  }
}

describe('Receipt upload', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn(),
          getPublicUrl: vi.fn(),
        })),
      },
    };
  });

  it('rejects non-image/non-PDF files', async () => {
    const file = new File(['content'], 'document.txt', { type: 'text/plain' });
    const result = await uploadReceipt(file, mockSupabase);

    expect(result.success).toBe(false);
    expect(result.error).toContain('imagen o PDF');
  });

  it('rejects when Supabase is unavailable', async () => {
    const file = new File(['content'], 'receipt.png', { type: 'image/png' });
    const result = await uploadReceipt(file, null);

    expect(result.success).toBe(false);
    expect(result.error).toContain('no está disponible');
  });

  it('uploads PNG images successfully', async () => {
    const file = new File(['image data'], 'receipt.png', { type: 'image/png' });
    const publicUrl = 'https://storage.example.com/receipts/123-receipt.png';

    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl } }),
    });

    const result = await uploadReceipt(file, mockSupabase);

    expect(result.success).toBe(true);
    expect(result.publicUrl).toBe(publicUrl);
  });

  it('uploads JPEG images successfully', async () => {
    const file = new File(['image data'], 'receipt.jpg', { type: 'image/jpeg' });
    const publicUrl = 'https://storage.example.com/receipts/123-receipt.jpg';

    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl } }),
    });

    const result = await uploadReceipt(file, mockSupabase);

    expect(result.success).toBe(true);
    expect(result.publicUrl).toBe(publicUrl);
  });

  it('uploads PDF files successfully', async () => {
    const file = new File(['pdf data'], 'receipt.pdf', { type: 'application/pdf' });
    const publicUrl = 'https://storage.example.com/receipts/123-receipt.pdf';

    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl } }),
    });

    const result = await uploadReceipt(file, mockSupabase);

    expect(result.success).toBe(true);
    expect(result.publicUrl).toBe(publicUrl);
  });

  it('handles upload errors from Supabase', async () => {
    const file = new File(['image data'], 'receipt.png', { type: 'image/png' });
    const uploadError = new Error('Quota exceeded');

    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: uploadError }),
      getPublicUrl: vi.fn(),
    });

    const result = await uploadReceipt(file, mockSupabase);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Quota exceeded');
  });

  it('handles network errors during upload', async () => {
    const file = new File(['image data'], 'receipt.png', { type: 'image/png' });

    mockSupabase.storage.from.mockReturnValue({
      upload: vi.fn().mockRejectedValue(new Error('Network timeout')),
      getPublicUrl: vi.fn(),
    });

    const result = await uploadReceipt(file, mockSupabase);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network timeout');
  });

  it('uses correct storage path format (receipts/timestamp-filename)', async () => {
    const file = new File(['image data'], 'myreceipt.png', { type: 'image/png' });
    const uploadMock = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.storage.from.mockReturnValue({
      upload: uploadMock,
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file' } }),
    });

    await uploadReceipt(file, mockSupabase);

    // Verify upload was called with correct bucket
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('products');

    // Verify path format matches receipts/timestamp-filename
    const uploadCall = uploadMock.mock.calls[0];
    expect(uploadCall[0]).toMatch(/^receipts\/\d+-myreceipt\.png$/);
    expect(uploadCall[1]).toBe(file);
    expect(uploadCall[2]).toEqual({ upsert: true });
  });
});
