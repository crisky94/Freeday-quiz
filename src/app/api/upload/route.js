import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import uploadToCloudinary from '@/lib/uploadCloudinary';

export const POST = async (req) => {
  try {
    // Obtener el formData de la solicitud
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha subido ninguna imagen.' },
        { status: 400 }
      );
    }

    // Convertir el archivo a un buffer usando arrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Definir la ruta de la carpeta 'uploads'
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Crear la carpeta 'uploads' si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Definir la ruta completa donde se guardará el archivo
    const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);

    // Guardar el buffer temporalmente en el sistema de archivos
    await fs.promises.writeFile(filePath, buffer);

    // Subir el archivo a Cloudinary
    const uploadedImage = await uploadToCloudinary(filePath);

    // Eliminar el archivo temporal después de la subida
    await fs.promises.unlink(filePath);

    return NextResponse.json({ imageUrl: uploadedImage.url }, { status: 200 });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return NextResponse.json(
      { error: 'Error al subir imagen' },
      { status: 500 }
    );
  }
};
