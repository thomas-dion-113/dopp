<?php

namespace App\Exception;

use App\Entity\User;
use Symfony\Component\Security\Core\Exception\AccountStatusException;

class EmailNotVerifiedException extends AccountStatusException
{
    public function __construct(User $user)
    {
        parent::__construct('Email address not verified.');
        $this->setUser($user);
    }
}