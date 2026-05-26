<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Book::query();
        
        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('author', 'like', "%{$searchTerm}%")
                  ->orWhere('isbn', 'like', "%{$searchTerm}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $books = $query->paginate($perPage);
        return response()->json($books);
    }

    /**
     * Mantém livro
     */
    public function store(Request $request)
    {
        $request->validate([
            'isbn' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'genre' => 'nullable|string|max:255',
            'cover_url' => 'nullable|string|max:1000',
            'total_quantity' => 'required|integer|min:1',
        ]);

        $existingBook = Book::where('isbn', $request->isbn)
                            ->where('school_id', auth()->user()->school_id)
                            ->first();

        if ($existingBook) {
            if ($request->has('force_add_quantity') && $request->force_add_quantity == true) {
                $existingBook->total_quantity += $request->total_quantity;
                $existingBook->available_quantity += $request->total_quantity;
                $existingBook->save();
                return response()->json($existingBook, 200);
            }

            return response()->json([
                'message' => "Este livro já está cadastrado. Deseja adicionar {$request->total_quantity} à quantidade existente?",
                'requires_confirmation' => true,
                'existing_book' => $existingBook
            ], 409);
        }

        $data = $request->all();
        $data['available_quantity'] = $request->total_quantity;

        $book = new Book($data);
        $book->school_id = auth()->user()->school_id;
        $book->save();

        return response()->json($book, 201);
    }

    /**
     * Scanner de livros
     */
    public function scan(Request $request)
    {
        $request->validate([
            'isbn' => 'required|string|max:255',
        ]);

        $existingBook = Book::where('isbn', $request->isbn)
                            ->where('school_id', auth()->user()->school_id)
                            ->first();

        if ($existingBook) {
            $existingBook->total_quantity += 1;
            $existingBook->available_quantity += 1;
            $existingBook->save();
            
            return response()->json([
                'message' => 'Estoque atualizado (+1)',
                'book' => $existingBook
            ], 200);
        }

        // Busca de livros em APIs externas
        $cleanIsbn = str_replace('-', '', $request->isbn);
        
        // 1. BrasilAPI
        $brasilApiUrl = "https://brasilapi.com.br/api/isbn/v1/{$cleanIsbn}";
        $response = Http::get($brasilApiUrl);
        $bookData = null;
        $coverUrl = "https://covers.openlibrary.org/b/isbn/{$cleanIsbn}-L.jpg";

        if ($response->successful()) {
            $data = $response->json();
            $bookData = [
                'title' => $data['title'] ?? 'Livro Desconhecido',
                'author' => isset($data['authors']) && count($data['authors']) > 0 ? implode(', ', $data['authors']) : 'Autor Desconhecido',
                'genre' => isset($data['subjects']) && count($data['subjects']) > 0 ? $data['subjects'][0] : '',
                'cover_url' => $data['cover_url'] ?? $coverUrl
            ];
        }

        // 2. Google Books
        if (!$bookData) {
            // Recupera a chave configurada de forma segura
            $apiKey = config('services.google_books.key'); 
            
            // Adiciona o parâmetro 'key' na URL apenas se a chave existir
            $googleUrl = "https://www.googleapis.com/books/v1/volumes?q=isbn:{$cleanIsbn}";
            if (!empty($apiKey)) {
                $googleUrl .= "&key={$apiKey}";
            }
            
            $googleResponse = Http::get($googleUrl);
            
            if ($googleResponse->successful()) {
                $data = $googleResponse->json();
                
                if (isset($data['items']) && count($data['items']) > 0) {
                    $volumeInfo = $data['items'][0]['volumeInfo'];
                    $gCover = $volumeInfo['imageLinks']['thumbnail'] ?? $coverUrl;
                    
                    // Troca http por https caso o Google retorne sem SSL
                    if ($gCover) {
                        $gCover = str_replace('http://', 'https://', $gCover);
                    }
                    
                    $bookData = [
                        'title' => $volumeInfo['title'] ?? 'Livro Desconhecido',
                        'author' => isset($volumeInfo['authors']) ? implode(', ', $volumeInfo['authors']) : 'Autor Desconhecido',
                        'genre' => isset($volumeInfo['categories']) ? $volumeInfo['categories'][0] : '',
                        'cover_url' => $gCover
                    ];
                }
            }
        }

        // 3. OpenLibrary fallback
        if (!$bookData) {
            $olUrl = "https://openlibrary.org/api/books?bibkeys=ISBN:{$cleanIsbn}&format=json&jscmd=data";
            $olResponse = Http::get($olUrl);
            
            if ($olResponse->successful()) {
                $data = $olResponse->json();
                $key = "ISBN:{$cleanIsbn}";
                if (isset($data[$key])) {
                    $bookData = [
                        'title' => $data[$key]['title'] ?? 'Livro Desconhecido',
                        'author' => $data[$key]['authors'][0]['name'] ?? 'Autor Desconhecido',
                        'genre' => '',
                        'cover_url' => $coverUrl
                    ];
                }
            }
        }

        if (!$bookData) {
            return response()->json([
                'message' => 'Livro não encontrado. Separe para cadastro manual.'
            ], 404);
        }

        // Create new book
        $newBook = new Book([
            'isbn' => $request->isbn,
            'title' => $bookData['title'],
            'author' => $bookData['author'],
            'genre' => $bookData['genre'],
            'total_quantity' => 1,
            'available_quantity' => 1,
            'cover_url' => $bookData['cover_url']
        ]);
        $newBook->school_id = auth()->user()->school_id;
        $newBook->save();

        return response()->json([
            'message' => 'Novo livro cadastrado!',
            'book' => $newBook
        ], 201);
    }

    /**
     * volta um livro específico
     */
    public function show(string $id)
    {
        $book = Book::findOrFail($id);
        return response()->json($book);
    }

    /**
     * Update um livro específico
     */
    public function update(Request $request, string $id)
    {
        $book = Book::findOrFail($id);

        $request->validate([
            'isbn' => 'sometimes|required|string|max:255',
            'title' => 'sometimes|required|string|max:255',
            'author' => 'sometimes|required|string|max:255',
            'genre' => 'nullable|string|max:255',
            'cover_url' => 'nullable|string|max:1000',
            'total_quantity' => 'sometimes|required|integer|min:1',
        ]);

        $data = $request->except(['available_quantity']);

        if ($request->has('total_quantity')) {
            $activeLoans = $book->loans()->where('status', 'active')->count();
            
            if ($request->total_quantity < $activeLoans) {
                return response()->json(['message' => 'A quantidade total não pode ser menor que o número de empréstimos ativos (' . $activeLoans . ').'], 422);
            }
            
            $data['available_quantity'] = $request->total_quantity - $activeLoans;
        }

        $book->update($data);

        return response()->json($book);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $book = Book::findOrFail($id);
        $book->delete();
        return response()->json(null, 204);
    }

    /**
     * Search book by ISBN using OpenLibrary API.
     */
    public function searchByIsbn($isbn)
    {
        // 1. Limpar o ISBN removendo hífens
        $cleanIsbn = str_replace('-', '', $isbn);

        // 2. Tentar na BrasilAPI (Excelente para ISBNs do Brasil como O Alquimista, etc)
        $brasilApiUrl = "https://brasilapi.com.br/api/isbn/v1/{$cleanIsbn}";
        $brasilResponse = Http::get($brasilApiUrl);

        if ($brasilResponse->successful()) {
            $data = $brasilResponse->json();
            return response()->json([
                'title' => $data['title'] ?? '',
                'author' => isset($data['authors']) && count($data['authors']) > 0 ? implode(', ', $data['authors']) : '',
                'genre' => isset($data['subjects']) && count($data['subjects']) > 0 ? $data['subjects'][0] : '',
                'isbn' => $isbn,
                'cover_url' => $data['cover_url'] ?? "https://covers.openlibrary.org/b/isbn/{$cleanIsbn}-L.jpg"
            ]);
        }

        // 3. Fallback: Tentar no Google Books
        $apiKey = config('services.google_books.key');
        $googleUrl = "https://www.googleapis.com/books/v1/volumes?q=isbn:{$cleanIsbn}";
        if (!empty($apiKey)) {
            $googleUrl .= "&key={$apiKey}";
        }
        
        $googleResponse = Http::get($googleUrl);

        if ($googleResponse->successful()) {
            $data = $googleResponse->json();

            if (isset($data['items']) && count($data['items']) > 0) {
                $volumeInfo = $data['items'][0]['volumeInfo'];

                $coverUrl = $volumeInfo['imageLinks']['thumbnail'] ?? "https://covers.openlibrary.org/b/isbn/{$cleanIsbn}-L.jpg";
                if ($coverUrl) {
                    $coverUrl = str_replace('http://', 'https://', $coverUrl);
                }

                return response()->json([
                    'title' => $volumeInfo['title'] ?? '',
                    'author' => isset($volumeInfo['authors']) ? implode(', ', $volumeInfo['authors']) : '',
                    'genre' => isset($volumeInfo['categories']) ? $volumeInfo['categories'][0] : '',
                    'isbn' => $isbn,
                    'cover_url' => $coverUrl
                ]);
            }
        }

        // 4. Fallback: OpenLibrary
        $olUrl = "https://openlibrary.org/api/books?bibkeys=ISBN:{$cleanIsbn}&format=json&jscmd=data";
        $olResponse = Http::get($olUrl);

        if ($olResponse->successful()) {
            $data = $olResponse->json();
            $key = "ISBN:{$cleanIsbn}";

            if (isset($data[$key])) {
                $bookData = $data[$key];
                return response()->json([
                    'title' => $bookData['title'] ?? '',
                    'author' => $bookData['authors'][0]['name'] ?? '',
                    'genre' => '',
                    'isbn' => $isbn,
                    'cover_url' => "https://covers.openlibrary.org/b/isbn/{$cleanIsbn}-L.jpg"
                ]);
            }
        }

        return response()->json(['message' => 'Livro não encontrado em nenhum de nossos provedores.'], 404);
    }
}
