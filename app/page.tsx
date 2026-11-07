'use client';

import React, { useState, useEffect } from 'react';

// Type definition for student record
interface StudentRecord {
  _id: string;
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
  createdAt: string;
}

// Type for calculation results
interface CalculationResult {
  total: number;
  percentage: number;
  average: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

export default function StudentMarksCalculator() {
  // Form State
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [subject1, setSubject1] = useState('');
  const [subject2, setSubject2] = useState('');
  const [subject3, setSubject3] = useState('');
  const [subject4, setSubject4] = useState('');
  const [subject5, setSubject5] = useState('');

  // Results State
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);

  // Status & Feedback States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Saved Records from MongoDB
  const [savedRecords, setSavedRecords] = useState<StudentRecord[]>([]);
  const [isFetchingRecords, setIsFetchingRecords] = useState(true);

  // Load saved students on component mount
  useEffect(() => {
    fetchSavedStudents();
  }, []);

  // Fetch all saved student records from the backend API
  const fetchSavedStudents = async () => {
    try {
      setIsFetchingRecords(true);
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSavedRecords(data.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsFetchingRecords(false);
    }
  };

  // Helper to determine Grade and Pass/Fail status
  const calculateGradeAndStatus = (percentage: number): { grade: string; status: 'Pass' | 'Fail' } => {
    if (percentage >= 90) return { grade: 'A+', status: 'Pass' };
    if (percentage >= 80) return { grade: 'A', status: 'Pass' };
    if (percentage >= 70) return { grade: 'B', status: 'Pass' };
    if (percentage >= 60) return { grade: 'C', status: 'Pass' };
    if (percentage >= 50) return { grade: 'D', status: 'Pass' };
    return { grade: 'Fail', status: 'Fail' };
  };

  // Validation function
  const validateInputs = () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter the Student Name.');
      return false;
    }

    if (!rollNumber.trim()) {
      setErrorMessage('Please enter the Roll Number.');
      return false;
    }

    const marks = [subject1, subject2, subject3, subject4, subject5];

    for (let i = 0; i < marks.length; i++) {
      const val = marks[i].trim();
      if (val === '') {
        setErrorMessage(`Please enter marks for Subject ${i + 1}.`);
        return false;
      }
      const num = Number(val);
      if (isNaN(num)) {
        setErrorMessage(`Subject ${i + 1} marks must be a valid number.`);
        return false;
      }
      if (num < 0 || num > 100) {
        setErrorMessage(`Subject ${i + 1} marks must be between 0 and 100.`);
        return false;
      }
    }

    return true;
  };

  // Handle Calculate & Save
  const handleCalculateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const s1 = Number(subject1);
    const s2 = Number(subject2);
    const s3 = Number(subject3);
    const s4 = Number(subject4);
    const s5 = Number(subject5);

    // Calculate metrics
    const total = s1 + s2 + s3 + s4 + s5;
    const percentage = Number(((total / 500) * 100).toFixed(2));
    const average = Number((total / 5).toFixed(2));
    const { grade, status } = calculateGradeAndStatus(percentage);

    const calculated: CalculationResult = {
      total,
      percentage,
      average,
      grade,
      status,
    };

    // Update result card state immediately for fast feedback
    setCurrentResult(calculated);

    // Save to MongoDB
    setIsLoading(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          rollNumber: rollNumber.trim(),
          subject1: s1,
          subject2: s2,
          subject3: s3,
          subject4: s4,
          subject5: s5,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage('Student marks calculated and saved to MongoDB successfully!');
        // Refresh records list
        fetchSavedStudents();
      } else {
        setErrorMessage(data.message || 'Calculated locally, but failed to save to MongoDB.');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage('Database connection failed. Ensure MongoDB is running and MONGODB_URI is set.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Record
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) {
      return;
    }

    setIsDeletingId(id);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage('Student record deleted successfully.');
        setSavedRecords((prev) => prev.filter((item) => item._id !== id));
      } else {
        setErrorMessage(data.message || 'Failed to delete student record.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setErrorMessage('Failed to connect to backend to delete record.');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Reset Form
  const handleReset = () => {
    setName('');
    setRollNumber('');
    setSubject1('');
    setSubject2('');
    setSubject3('');
    setSubject4('');
    setSubject5('');
    setCurrentResult(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <>
      <div className="grid-overlay" />
      <main className="container">
        {/* Header */}
        <header className="app-header">
          <div className="brand-badge">
            <span className="pulsing-dot"></span>
            Next-Gen Academic Engine
          </div>
          <h1 className="main-title">Student Marks Calculator</h1>
          <p className="subtitle">
            Enter marks for 5 subjects to compute total, percentage, average, and performance grade with instant MongoDB synchronization.
          </p>
        </header>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="alert-box alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert-box alert-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Input Form */}
          <section className="futuristic-card">
            <h2 className="card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Student Details Form
            </h2>

            <form onSubmit={handleCalculateAndSave}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="student-name">
                    Student Full Name <span className="req">*</span>
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    placeholder="e.g. Alex Mercer"
                    className="futuristic-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="roll-number">
                    Roll Number / ID <span className="req">*</span>
                  </label>
                  <input
                    id="roll-number"
                    type="text"
                    placeholder="e.g. CS-2026-089"
                    className="futuristic-input"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label">
                  Subject Marks (Out of 100 each) <span className="req">*</span>
                </label>
                <div className="marks-grid">
                  <div>
                    <input
                      type="number"
                      placeholder="Sub 1"
                      className="futuristic-input"
                      value={subject1}
                      min="0"
                      max="100"
                      onChange={(e) => setSubject1(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Sub 2"
                      className="futuristic-input"
                      value={subject2}
                      min="0"
                      max="100"
                      onChange={(e) => setSubject2(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Sub 3"
                      className="futuristic-input"
                      value={subject3}
                      min="0"
                      max="100"
                      onChange={(e) => setSubject3(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Sub 4"
                      className="futuristic-input"
                      value={subject4}
                      min="0"
                      max="100"
                      onChange={(e) => setSubject4(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Sub 5"
                      className="futuristic-input"
                      value={subject5}
                      min="0"
                      max="100"
                      onChange={(e) => setSubject5(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="btn-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Processing...'
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                        <line x1="8" y1="6" x2="16" y2="6"></line>
                        <line x1="16" y1="14" x2="16" y2="18"></line>
                        <path d="M16 10h.01"></path>
                        <path d="M12 10h.01"></path>
                        <path d="M8 10h.01"></path>
                        <path d="M12 14h.01"></path>
                        <path d="M8 14h.01"></path>
                        <path d="M12 18h.01"></path>
                        <path d="M8 18h.01"></path>
                      </svg>
                      Calculate & Save Record
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  Reset Form
                </button>
              </div>
            </form>
          </section>

          {/* Right Column: Result Card */}
          <section className="futuristic-card">
            <h2 className="card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="12 6 12 12 16 14"></polygon>
              </svg>
              Calculation Results
            </h2>

            {currentResult ? (
              <div className="result-display">
                <div className={`grade-banner ${currentResult.status === 'Pass' ? 'pass' : 'fail'}`}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Performance Grade
                    </div>
                    <div className={`grade-badge-huge ${currentResult.status === 'Pass' ? 'pass' : 'fail'}`}>
                      {currentResult.grade}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`status-chip ${currentResult.status === 'Pass' ? 'pass' : 'fail'}`}>
                      {currentResult.status}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      {currentResult.status === 'Pass' ? 'Status: Qualified' : 'Status: Needs Retake'}
                    </div>
                  </div>
                </div>

                <div className="metrics-grid">
                  <div className="metric-box">
                    <div className="metric-label">Total Score</div>
                    <div className="metric-value">{currentResult.total}</div>
                    <div className="metric-sub">/ 500</div>
                  </div>

                  <div className="metric-box">
                    <div className="metric-label">Percentage</div>
                    <div className="metric-value">{currentResult.percentage}%</div>
                    <div className="metric-sub">Aggregated</div>
                  </div>

                  <div className="metric-box">
                    <div className="metric-label">Average</div>
                    <div className="metric-value">{currentResult.average}</div>
                    <div className="metric-sub">per Subject</div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progress Meter</span>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>{currentResult.percentage}%</span>
                  </div>
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${Math.min(100, Math.max(0, currentResult.percentage))}%` }}
                    />
                  </div>
                </div>

                {/* Grade Scale Reference */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                  <span style={{ color: 'var(--neon-cyan)' }}>Scale:</span> 90-100: A+ | 80-89: A | 70-79: B | 60-69: C | 50-59: D | &lt;50: Fail
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <p>No calculation yet.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Fill out student details and click <strong>Calculate & Save Record</strong>.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Database Records Section */}
        <section className="futuristic-card records-section">
          <div className="records-header">
            <h2 className="card-title" style={{ margin: 0, padding: 0, border: 'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
              Saved Records Database
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="records-count">
                {savedRecords.length} {savedRecords.length === 1 ? 'Record' : 'Records'} Found
              </span>
              <button
                type="button"
                onClick={fetchSavedStudents}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                title="Refresh database records"
              >
                Refresh
              </button>
            </div>
          </div>

          {isFetchingRecords ? (
            <div className="empty-state">
              <p>Fetching student records from MongoDB...</p>
            </div>
          ) : savedRecords.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <p>No student records found in MongoDB.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Save your first student marks calculation using the form above.
              </p>
            </div>
          ) : (
            <div className="records-table-container">
              <table className="futuristic-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll Number</th>
                    <th>Marks (S1-S5)</th>
                    <th>Total (/500)</th>
                    <th>Percentage</th>
                    <th>Average</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {savedRecords.map((item) => (
                    <tr key={item._id}>
                      <td className="student-name-cell">{item.name}</td>
                      <td className="student-roll-cell">{item.rollNumber}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {item.subject1}, {item.subject2}, {item.subject3}, {item.subject4}, {item.subject5}
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.total}</td>
                      <td style={{ color: 'var(--neon-cyan)', fontWeight: 600 }}>{item.percentage}%</td>
                      <td>{item.average}</td>
                      <td>
                        <span className={`grade-badge-sm ${item.status === 'Pass' ? 'pass' : 'fail'}`}>
                          {item.grade}
                        </span>
                      </td>
                      <td>
                        <span className={`status-chip ${item.status === 'Pass' ? 'pass' : 'fail'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger-outline"
                          disabled={isDeletingId === item._id}
                          onClick={() => handleDelete(item._id)}
                        >
                          {isDeletingId === item._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
