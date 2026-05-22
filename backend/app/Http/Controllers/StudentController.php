<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::orderBy('name')->get();
        return response()->json($students);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'classroom' => 'required|string|max:255',
        ]);

        $student = new Student($request->only(['name', 'classroom']));
        $student->school_id = auth()->user()->school_id;
        $student->save();

        return response()->json($student, 201);
    }

    public function show(string $id)
    {
        $student = Student::findOrFail($id);
        return response()->json($student);
    }

    public function update(Request $request, string $id)
    {
        $student = Student::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'classroom' => 'sometimes|string|max:255',
        ]);

        $student->update($request->only(['name', 'classroom']));

        return response()->json($student);
    }

    public function destroy(string $id)
    {
        $student = Student::findOrFail($id);
        $student->delete();
        return response()->json(null, 204);
    }
}
