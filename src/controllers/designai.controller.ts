import { Request, Response } from 'express';
import { db, bucket } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import Decor8AI from "decor8ai";

// GET /api/designai/history?userId=xxx
export async function getDesignHistory(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string || '';
    const usersRef = db.collection('users');
    const userSnap = await usersRef.where('userId', '==', userId).get();
    if (userSnap.empty) {
      // Return empty array if user not found
      return res.status(200).json({ error: '', data: [], status: 200 });
    }
    const designsRef = db.collection('designai-designs');
    const designsSnap = await designsRef.where('userId', '==', userId).get();
    const designs: any[] = [];
    designsSnap.forEach(doc => {
      const data = doc.data();
      // Defensive: ensure file and designed_image are always present
      if (!data.file) data.file = '';
      // Always use designed_image if present, else []
      if (!Array.isArray(data.designed_image)) data.designed_image = [];
      // For compatibility, also add a 'generated_images' field for frontend mapping
      data.generated_images = Array.isArray(data.designed_image)
        ? data.designed_image.map((url: string, idx: number) => ({
            id: `${data.design_id}_${idx}`,
            name: `${data.design_name} ${idx + 1}`,
            url,
            design_id: data.design_id,
            created_at: data.created_at || '',
          }))
        : [];
      designs.push(data);
    });
    
    return res.json({ error: '', data: designs, status: 200 });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, data: [], status: 500 });
  }
}

// POST /api/designai/create
export async function createDesign(req: Request, res: Response) {
  try {
    const body = req.body;
    const usersRef = db.collection('users');
    const userSnap = await usersRef.where('userId', '==', body.userId).get();
    if (userSnap.empty) {
      return res.status(400).json({ error: 'Invalid Request', status: 400 });
    }
    const userDoc = userSnap.docs[0];
    const design_id = uuidv4();
    const design = {
      userId: body.userId,
      design_name: body.design_name || '',
      design_id: design_id,
      design_type: body.design_type || '',
      file: body.file || '',
      room_type: body.room_type || '',
      virtual_staging: body.virtual_staging || false,
      no_of_ideas: body.no_of_ideas || 1,
      created_at: new Date().toISOString(),
      designed_image: body.designed_images || '',
    };
    await db.collection('designai-designs').doc(`${design_id}-${body.userId}`).set(design);
    return res.json({ error: '', data: design, status: 200 });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, data: {}, status: 500 });
  }
}

// POST /api/designai/generate
export async function generateDesign(req: Request, res: Response) {
  try {
    const { userId, design_id, file, room_type, design_type, no_of_ideas, generate_design_with_original, color_scheme, seasonal_decor } = req.body;
    // 1. Get user credits from Firestore
    const userSnap = await db.collection('users').where('userId', '==', userId).get();
    if (userSnap.empty) {
      return res.status(400).json({ error: 'User not found', data: {}, status: 400 });
    }
    const userDoc = userSnap.docs[0];
    const userData = userDoc.data();
    if (!userData.design_credits || userData.design_credits < no_of_ideas) {
      return res.status(400).json({ error: 'No Design Credits', data: {}, status: 400 });
    }
    // 2. Deduct credits and increment design count
    await db.collection('users').doc(userDoc.id).update({
      design_credits: userData.design_credits - no_of_ideas,
      design_count: (userData.design_count || 0) + 1,
    });
    // 3. Call Decor8AI to generate images
    const decor8 = new Decor8AI();
    const response = await decor8.generateDesigns(
      file,
      room_type,
      design_type,
      null,
      no_of_ideas,
      generate_design_with_original,
      color_scheme,
      seasonal_decor
    );
    if (response.error) {
      return res.status(500).json({ error: response.error, data: {}, status: 500 });
    }
    // 4. Upload generated images to Firebase Storage
    const designs = response.info.images;
    let designed_image: string[] = [];
    for (let i = 0; i < designs.length; i++) {
      const buffer = Buffer.from(designs[i].data, 'base64');
      const storageFile = bucket.file(`designs/generated/${userId}_${design_id}_${i}.jpg`);
      await storageFile.save(buffer, { contentType: 'image/jpeg' });
      await storageFile.makePublic();
      designed_image.push(storageFile.publicUrl());
    }
    // 5. Update Firestore document
    const docRef = db.collection('designai-designs').doc(`${design_id}-${userId}`);
    await docRef.update({ designed_image });
    // 6. Return updated design
    const updatedDoc = await docRef.get();
    return res.json({ error: "", data: updatedDoc.data(), status: 200 });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, data: {}, status: 500 });
  }
}

// POST /api/designai/initialize-design
export async function initializeDesign(req: Request, res: Response) {
  try {
    const { userId, design_name, design_type, file, room_type, virtual_staging, no_of_ideas, created_at, color_scheme, seasonal_decor, generate_design_with_original } = req.body;
    const design_id = uuidv4();
    // If file is base64, upload to Firebase Storage
    let fileUrl = file;
    if (file && file.length > 100 && !file.startsWith('http')) {
      const buffer = Buffer.from(file, 'base64');
      const storageFile = bucket.file(`designs/before/${userId}_${design_id}.jpg`);
      await storageFile.save(buffer, { contentType: 'image/jpeg' });
      await storageFile.makePublic();
      fileUrl = storageFile.publicUrl();
    }
    const design = {
      userId,
      design_name: design_name || "",
      design_id,
      design_type: design_type || "",
      file: fileUrl,
      room_type: room_type || "",
      virtual_staging: virtual_staging || false,
      no_of_ideas: no_of_ideas || 1,
      created_at: created_at || new Date().toISOString(),
      color_scheme: color_scheme || "",
      seasonal_decor: seasonal_decor || "",
      generate_design_with_original: generate_design_with_original || false,
      designed_image: [],
    };
    await db.collection('designai-designs').doc(`${design_id}-${userId}`).set(design);
    return res.json({ error: "", data: design, status: 200 });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, data: {}, status: 500 });
  }
}

async function uploadBase64ImageToFirebase(base64Data: string, filename: string): Promise<string> {
  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, 'base64');
  const file = bucket.file(`myfile/changed/${filename}`);
  await file.save(buffer, { contentType: 'image/jpeg' });
  await file.makePublic();
  return file.publicUrl();
} 