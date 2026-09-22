<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case New = 'new';
    case InReview = 'in_review';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';
}
