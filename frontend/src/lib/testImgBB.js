// Test rápido para verificar que ImgBB funciona
// Puedes abrir la consola del navegador y ejecutar esto

async function testImgBB() {
  console.log('🧪 Testing ImgBB upload...');
  
  // Crear una imagen de prueba (pequeña)
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#C9A96E';
  ctx.fillRect(0, 0, 100, 100);
  
  // Convertir a blob
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const testFile = new File([blob], 'test.png', { type: 'image/png' });
  
  console.log('📤 Subiendo imagen de prueba a ImgBB...');
  
  try {
    // Nota: Este código debe ejecutarse desde el navegador, no desde Node.js
    const { uploadToImgBB } = await import('./imgbbUploader.js');
    const result = await uploadToImgBB(testFile);
    
    console.log('✅ Upload exitoso!');
    console.log('URL:', result.url);
    console.log('Miniatura:', result.thumb_url);
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Para ejecutar el test, abre la consola del navegador y escribe:
// testImgBB()

export { testImgBB };
