<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    //Bibliotecarios
    public function index()
    {
        // Pelo SchoolScope global, apenas os usuários da escola atual serão listados
        $users = User::all();
        return response()->json($users);
    }

    /**
     * mantém um bibliotecario novo
     */
    public function store(Request $request)
    {
        // Somente o admin deveria poder criar.
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admins can create users.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'document' => 'nullable|string|max:255',
            'role' => 'nullable|in:admin,librarian',
        ]);

        $user = new User($request->except('password'));
        $user->password = Hash::make($request->password);
        $user->school_id = auth()->user()->school_id;
        $user->role = $request->role ?? 'librarian'; //default bibliotecario
        $user->status = true;
        $user->save();

        return response()->json($user, 201);
    }

    /**
     * Mostra usuario
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Atualiza o usuario específico 
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        if ($request->user()->role !== 'admin' && $request->user()->id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8',
            'document' => 'nullable|string|max:255',
            'status' => 'sometimes|boolean',
        ]);

        $data = $request->except('password');
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json($user);
    }

    /**
     * Remove o usuario especifico
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete yourself.'], 400);
        }

        $user->delete();

        return response()->json(null, 204);
    }
}
