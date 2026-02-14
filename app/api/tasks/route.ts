import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getDataFromToken } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(req: Request) {
  try {
    const userId = await getDataFromToken();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const tasks = await Task.find({ userId }).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getDataFromToken();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;
    const image = formData.get('image') as File | null;

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    let imageUrl = '';
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${image.name.replace(/\s/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      const filePath = path.join(uploadDir, filename);

      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    await dbConnect();
    
    // Get highest order to append to end
    const lastTask = await Task.findOne({ userId }).sort({ order: -1 });
    const newOrder = lastTask ? lastTask.order + 1 : 0;

    const newTask = await Task.create({
      userId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      imageUrl,
      order: newOrder,
    });

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating task' }, { status: 500 });
  }
}
