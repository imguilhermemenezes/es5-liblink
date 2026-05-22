<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class School extends Model
{
    protected $fillable = [
        'inep_code',
        'name',
        'max_loan_days',
        'max_books_per_student',
        'logo_url',
        'primary_color',
        'penalty_fine_per_day',
        'penalty_block_loans',
    ];

    protected function logoUrl(): Attribute {
        return Attribute::make (
            get: function (?string $value) {
                if (!$value) {
                    return asset('images/Logo.png');
                }
                return $value;
            }
        );
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }
}
