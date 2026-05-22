<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\SchoolScope);
    }

    protected $fillable = [
        'school_id',
        'name',
        'classroom',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }
}
