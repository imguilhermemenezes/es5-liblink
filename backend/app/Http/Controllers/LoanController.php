<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\Book;
use App\Models\Student;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $query = Loan::with(['book', 'user', 'student']);
        
        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->whereHas('student', function($sq) use ($searchTerm) {
                    $sq->where('name', 'like', "%{$searchTerm}%");
                })->orWhereHas('book', function($bq) use ($searchTerm) {
                    $bq->where('title', 'like', "%{$searchTerm}%");
                });
            });
        }
        
        $perPage = $request->get('per_page', 15);
        $loans = $query->orderBy('created_at', 'desc')->paginate($perPage);
        return response()->json($loans);
    }

    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'student_name' => 'required|string|max:255',
            'student_class' => 'required|string|max:255',
            'due_date' => 'nullable|date',
        ]);

        $book = Book::findOrFail($request->book_id);

        if ($book->available_quantity <= 0) {
            return response()->json(['message' => 'Livro não disponível para empréstimo.'], 400);
        }

        $student = Student::firstOrCreate([
            'name' => $request->student_name,
            'classroom' => $request->student_class,
            'school_id' => auth()->user()->school_id,
        ]);

        // Verificar se aluno tem empréstimos atrasados
        $overdueLoans = Loan::where('student_id', $student->id)
            ->where('status', 'active')
            ->where('due_date', '<', Carbon::now())
            ->exists();

        if ($overdueLoans && !$request->has('force')) {
            return response()->json([
                'message' => 'O aluno possui empréstimos atrasados. Deseja continuar?',
                'requires_confirmation' => true
            ], 409); // Conflict
        }

        // Se tiver atraso, calcular multa e atualizar empréstimo
        
        try {
            DB::beginTransaction();

            $loan = new Loan([
                'book_id' => $book->id,
                'user_id' => auth()->id(), // bibliotecário
                'student_id' => $student->id,
                'loan_date' => Carbon::now(),
                'due_date' => $request->due_date ?? Carbon::now()->addDays(auth()->user()->school->max_loan_days ?? 7),
                'status' => 'active'
            ]);
            
            $loan->school_id = auth()->user()->school_id;
            $loan->save();

            $book->decrement('available_quantity');

            DB::commit();

            return response()->json($loan, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao registrar empréstimo.', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id)
    {
        $loan = Loan::with(['book', 'user', 'student'])->findOrFail($id);
        return response()->json($loan);
    }

    //update empréstimo
    public function update(Request $request, string $id)
    {
        $loan = Loan::findOrFail($id);
        $request->validate([
            'due_date' => 'sometimes|date',
            'status' => 'sometimes|in:active,returned,lost'
        ]);

        $loan->update($request->only(['due_date', 'status']));

        return response()->json($loan);
    }

    public function returnBook(Request $request, string $id)
    {
        $loan = Loan::findOrFail($id);

        if ($loan->status !== 'active') {
            return response()->json(['message' => 'Este empréstimo não está ativo.'], 400);
        }

        try {
            DB::beginTransaction();

            $loan->update(['status' => 'returned']);
            $loan->book()->increment('available_quantity');

            DB::commit();

            return response()->json(['message' => 'Devolução registrada com sucesso.', 'loan' => $loan]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao processar devolução.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id)
    {
        $loan = Loan::findOrFail($id);
        $loan->delete();
        return response()->json(null, 204);
    }
}
