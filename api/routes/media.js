const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

/* catégorie → sous-dossier Cloudinary */
const VALID_CATS = ['20m2', '37m2', '56m2', '74m2', 'options'];

router.get('/', async (req, res) => {
  try {
    const cat  = req.query.category;
    // "Tous" → recherche par préfixe de public_id pour inclure tous les sous-dossiers
    const expr = cat && VALID_CATS.includes(cat)
      ? `folder:matths-houses/${cat}`
      : 'public_id:matths-houses/*';

    const result = await cloudinary.search
      .expression(expr)
      .sort_by('created_at', 'asc')   // anciens en premier → images avant PDFs
      .max_results(200)
      .execute();

    // Trier : images en tête, PDFs / docs à la fin
    const sorted = [...result.resources].sort((a, b) => {
      const aImg = a.resource_type === 'image' ? 0 : 1;
      const bImg = b.resource_type === 'image' ? 0 : 1;
      return aImg - bImg;
    });

    res.json({ files: sorted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

    const cat    = req.body?.category;
    const folder = cat && VALID_CATS.includes(cat)
      ? `matths-houses/${cat}`
      : 'matths-houses';

    const b64    = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'auto',
      public_id: `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`,
    });

    res.json({ success: true, file: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:publicId', async (req, res) => {
  try {
    const publicId    = decodeURIComponent(req.params.publicId);
    const resType     = req.query.resource_type || 'image';
    await cloudinary.uploader.destroy(publicId, { resource_type: resType });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
