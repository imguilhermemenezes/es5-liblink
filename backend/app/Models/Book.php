<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\SchoolScope);
    }

    protected $fillable = [
        'school_id',
        'isbn',
        'title',
        'author',
        'genre',
        'cdd_cdu',
        'total_quantity',
        'available_quantity',
        'cover_url',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function loans(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Loan::class);
    }
}
