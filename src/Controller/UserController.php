<?php

namespace App\Controller;

use Doctrine\DBAL\DBALException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class UserController extends AbstractController
{
    public function editUser(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $data = json_decode($request->getContent(), true);

        $name = $data['name'];
        $user = $this->getUser();

        try {
            if ($user) {
                $user->setName($name);
                $em->flush();
            } else {
                return new JsonResponse('Unauthorized', 401);
            }
        }
        catch(DBALException $e){
            $errorMessage = $e->getMessage();
            return new JsonResponse($errorMessage, 400);
        }
        catch(\Exception $e){
            $errorMessage = $e->getMessage();
            return new JsonResponse($errorMessage, 400);
        }

        return new Response('User successfully edited');
    }
}