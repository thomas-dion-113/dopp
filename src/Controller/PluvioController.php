<?php

namespace App\Controller;

use App\Entity\Pluvio;
use CrEOF\Spatial\PHP\Types\Geometry\Point;
use Doctrine\DBAL\DBALException;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PluvioController extends AbstractController
{
    public function createPluvio(Request $request, ValidatorInterface $validator)
    {
        $em = $this->getDoctrine()->getManager();

        $data = json_decode($request->getContent(), true);

        $name = $data['name'];
        $coordinates = json_decode($data['coordinates']);
        $user = $this->getUser();

        $coordinates = new Point($coordinates->lat, $coordinates->lng);

        try {
            $pluvio = new Pluvio();
            $pluvio->setName($name);
            $pluvio->setCoordinates($coordinates);
            $pluvio->setUser($user);

            $em->persist($pluvio);
            $em->flush();
        }
        catch(DBALException $e){
            $errorMessage = $e->getMessage();
            return new JsonResponse($errorMessage, 400);
        }
        catch(\Exception $e){
            $errorMessage = $e->getMessage();
            return new JsonResponse($errorMessage, 400);
        }

        return new Response(sprintf('Pluvio %s successfully created', $user->getUsername()));
    }

    public function pluvios()
    {
        $em = $this->getDoctrine()->getManager();
        $user = $this->getUser();

        $pluvios = $em->getRepository(Pluvio::class)->findBy([
            'user' => $user,
        ]);

        return new JsonResponse(json_encode($pluvios), 200);
    }

    public function pluvio(int $id, Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $user = $this->getUser();

        $pluvio = $em->getRepository(Pluvio::class)->findOneBy([
            'user' => $user,
            'id' => $id
        ]);

        if ($pluvio) {
            return new JsonResponse(json_encode($pluvio), 200);
        } else {
            return new JsonResponse("null", 404);
        }
    }
}