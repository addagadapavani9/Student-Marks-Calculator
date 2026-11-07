import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript interface defining the Student data structure
export interface IStudent extends Document {
  name: string;
  rollNumber: string;
  subject1: number;
  subject2: number;
  subject3: number;
  subject4: number;
  subject5: number;
  total: number;
  percentage: number;
  average: number;
  grade: string;
  status: 'Pass' | 'Fail';
  createdAt: Date;
}

// Mongoose schema definition with validation rules
const StudentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
    },
    subject1: {
      type: Number,
      required: [true, 'Subject 1 marks are required'],
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot exceed 100'],
    },
    subject2: {
      type: Number,
      required: [true, 'Subject 2 marks are required'],
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot exceed 100'],
    },
    subject3: {
      type: Number,
      required: [true, 'Subject 3 marks are required'],
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot exceed 100'],
    },
    subject4: {
      type: Number,
      required: [true, 'Subject 4 marks are required'],
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot exceed 100'],
    },
    subject5: {
      type: Number,
      required: [true, 'Subject 5 marks are required'],
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot exceed 100'],
    },
    total: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    average: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model during hot-reloading in Next.js
const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
