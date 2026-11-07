import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Student from '@/models/Student';

/**
 * Grade and Status Helper Function
 * Calculates grade and status based on calculated percentage
 */
function calculateGradeAndStatus(percentage: number): { grade: string; status: 'Pass' | 'Fail' } {
  let grade = 'Fail';
  let status: 'Pass' | 'Fail' = 'Fail';

  if (percentage >= 90) {
    grade = 'A+';
    status = 'Pass';
  } else if (percentage >= 80) {
    grade = 'A';
    status = 'Pass';
  } else if (percentage >= 70) {
    grade = 'B';
    status = 'Pass';
  } else if (percentage >= 60) {
    grade = 'C';
    status = 'Pass';
  } else if (percentage >= 50) {
    grade = 'D';
    status = 'Pass';
  } else {
    grade = 'Fail';
    status = 'Fail';
  }

  return { grade, status };
}

/**
 * GET /api/students
 * Fetches all student records sorted by newest first
 */
export async function GET() {
  try {
    await connectToDatabase();
    const students = await Student.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: students,
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch student records',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students
 * Validates, calculates results, and saves a student record in MongoDB
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, rollNumber, subject1, subject2, subject3, subject4, subject5 } = body;

    // 1. Validation: Ensure all fields are provided
    if (
      !name ||
      typeof name !== 'string' ||
      !name.trim() ||
      !rollNumber ||
      typeof rollNumber !== 'string' ||
      !rollNumber.trim()
    ) {
      return NextResponse.json(
        { success: false, message: 'Student Name and Roll Number are required.' },
        { status: 400 }
      );
    }

    const marks = [subject1, subject2, subject3, subject4, subject5].map(Number);

    // 2. Validation: Check if marks are valid numbers between 0 and 100
    for (let i = 0; i < marks.length; i++) {
      const mark = marks[i];
      if (isNaN(mark) || mark < 0 || mark > 100) {
        return NextResponse.json(
          {
            success: false,
            message: `Subject ${i + 1} marks must be a valid number between 0 and 100.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Calculation logic
    const total = marks.reduce((sum, current) => sum + current, 0);
    const percentage = Number(((total / 500) * 100).toFixed(2));
    const average = Number((total / 5).toFixed(2));
    const { grade, status } = calculateGradeAndStatus(percentage);

    // 4. Save to MongoDB
    await connectToDatabase();

    const newStudent = await Student.create({
      name: name.trim(),
      rollNumber: rollNumber.trim(),
      subject1: marks[0],
      subject2: marks[1],
      subject3: marks[2],
      subject4: marks[3],
      subject5: marks[4],
      total,
      percentage,
      average,
      grade,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Student record saved successfully',
        data: newStudent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving student record:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to save student record',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/students?id=xyz
 * Optional query parameter support for deleting a student
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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
    console.error('Error deleting student:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to delete student record',
      },
      { status: 500 }
    );
  }
}
