import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';

/**
 * DELETE /api/students/[id]
 * Deletes a student record by its MongoDB ObjectId
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return NextResponse.json(
        { success: false, message: 'Student record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student record deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting student record:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to delete student record',
      },
      { status: 500 }
    );
  }
}
