const fs = require('fs');
const path = require('path');

const imagePaths = {
  "NVIDIA RTX 4090": "rtx_4090_product_1778532592828.png",
  "AMD Ryzen 9 7950X": "ryzen_9_7950x_product_1778532607133.png",
  "Corsair 32GB RAM DDR5": "corsair_ram_ddr5_product_1778532620321.png",
  "Samsung 980 Pro 2TB": "samsung_980_pro_product_1778532639659.png",
  "ASUS ROG Swift 27\"": "asus_rog_monitor_product_1778532654478.png",
  "Logitech G Pro X Superlight": "logitech_g_pro_mouse_product_1778532666859.png",
  "Razer BlackWidow V4": "razer_blackwidow_v4_product_1778532684511.png",
  "Noctua NH-D15": "noctua_nhd15_product_1778532698524.png",
  "EVGA SuperNOVA 850W": "evga_psu_850w_product_1778532712500.png",
  "Fractal Design Meshify 2": "fractal_meshify_2_product_1778532730153.png"
};

const artifactDir = "C:\\Users\\matia\\.gemini\\antigravity\\brain\\bb870439-c943-446b-bd58-cc0719c67fdd";
const output = {};

Object.entries(imagePaths).forEach(([name, filename]) => {
  const fullPath = path.join(artifactDir, filename);
  if (fs.existsSync(fullPath)) {
    const base64 = fs.readFileSync(fullPath, { encoding: 'base64' });
    output[name] = base64;
  }
});

fs.writeFileSync(path.join(__dirname, 'product_images.json'), JSON.stringify(output));
console.log('✅ product_images.json created successfully!');
