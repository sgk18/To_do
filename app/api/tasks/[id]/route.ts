import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getDataFromToken } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getDataFromToken();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await req.json();

    await dbConnect();

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const allowedUpdates = ['title', 'description', 'dueDate', 'completed', 'reminderSent'];
    allowedUpdates.forEach((key) => {
        if (data[key] !== undefined) {
            task[key] = data[key];
        }
    });

    await task.save();

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating task' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getDataFromToken();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await dbConnect();
    const result = await Task.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting task' }, { status: 500 });
  }
}
