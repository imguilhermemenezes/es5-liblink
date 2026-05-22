<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\School;
use App\Models\User;

class SchoolController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'school_name' => 'required|string|max:255',
            'inep_code' => 'required|string|max:255|unique:schools,inep_code',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|string|email|max:255|unique:users,email',
            'admin_password' => 'required|string|min:8|confirmed',
            'admin_document' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $school = School::create([
                'name' => $request->school_name,
                'inep_code' => $request->inep_code,
                // defaults
                'max_loan_days' => 14,
                'max_books_per_student' => 3,
            ]);

            $user = User::create([
                'name' => $request->admin_name,
                'email' => $request->admin_email,
                'password' => Hash::make($request->admin_password),
                'school_id' => $school->id,
                'role' => 'admin',
                'status' => true,
                'document' => $request->admin_document,
            ]);

            DB::commit();

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Escola registrada com sucesso!',
                'school' => $school,
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Ocorreu um erro ao registrar a escola.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function showConfig(Request $request)
    {
        // Only accessible by auth users
        $school = $request->user()->school;
        return response()->json($school);
    }

    public function updateConfig(Request $request)
    {
        $school = $request->user()->school;
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'max_loan_days' => 'sometimes|integer|min:1',
            'max_books_per_student' => 'sometimes|integer|min:1',
            'logo_url' => 'nullable|string|max:1000',
            'primary_color' => 'sometimes|string|max:7',
            'penalty_fine_per_day' => 'sometimes|numeric|min:0',
            'penalty_block_loans' => 'sometimes|boolean',
        ]);

        $school->update($request->only([
            'name', 'max_loan_days', 'max_books_per_student', 'logo_url', 
            'primary_color', 'penalty_fine_per_day', 'penalty_block_loans'
        ]));

        return response()->json([
            'message' => 'Configurações atualizadas com sucesso.',
            'school' => $school
        ]);
    }
}
