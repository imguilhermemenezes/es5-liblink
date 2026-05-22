<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Loan;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $totalBooks = Book::sum('total_quantity');
        $availableBooks = Book::sum('available_quantity');
        $borrowedBooks = $totalBooks - $availableBooks;

        $activeLoans = Loan::where('status', 'active')->count();
        
        $overdueLoans = Loan::where('status', 'active')
            ->where('due_date', '<', Carbon::now())
            ->count();

        // Optional: recent loans
        $recentLoans = Loan::with(['book', 'user', 'student'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_books' => $totalBooks,
                'available_books' => $availableBooks,
                'borrowed_books' => $borrowedBooks,
                'active_loans' => $activeLoans,
                'overdue_loans' => $overdueLoans,
            ],
            'recent_loans' => $recentLoans
        ]);
    }
}
