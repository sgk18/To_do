import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getDataFromToken } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const userId = await getDataFromToken();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await req.json(); // items should be array of { id, order }

    if (!Array.isArray(items)) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    await dbConnect();

    // Loop through items and update order
    // Using bulkWrite for efficiency could be better, but Promise.all is okay for small sets
    const updatePromises = items.map((item: any) => 
      Task.updateOne(
        { _id: item.id, userId }, // Ensure user owns the task
        { $set: { order: item.order } }
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Tasks reordered' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error reordering tasks' }, { status: 500 });
  }
}
