<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Loan extends Model
{
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\SchoolScope);
    }

    protected $fillable = [
        'school_id',
        'book_id',
        'user_id',
        'student_id',
        'loan_date',
        'due_date',
        'status',
        'return_observations',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
