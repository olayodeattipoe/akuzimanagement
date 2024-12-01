import sharp from 'sharp';

export const convertToWebP = async (base64Image) => {
    try {
        // Extract the actual base64 data (remove data:image/...;base64,)
        const base64Data = base64Image.split(';base64,').pop();
        
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Convert to WebP using sharp
        const webpBuffer = await sharp(imageBuffer)
            .webp({ quality: 80 }) // You can adjust quality (0-100)
            .toBuffer();
        
        // Convert back to base64
        const webpBase64 = `data:image/webp;base64,${webpBuffer.toString('base64')}`;
        
        return webpBase64;
    } catch (error) {
        console.error('Error converting image to WebP:', error);
        throw error;
    }
}; 