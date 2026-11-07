export class FileStorageService {
  async uploadImage(file: Express.Multer.File) {
    return {
      url: `https://storage.placeholder/pak-split/${Date.now()}-${file.originalname}`,
      size: file.size,
      mimeType: file.mimetype,
      provider: 'storage-abstraction-placeholder',
    };
  }
}
