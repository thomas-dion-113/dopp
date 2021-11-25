<?php

namespace App\Controller;

use App\Entity\Pluvio;
use App\Entity\Releve;
use CrEOF\Spatial\PHP\Types\Geometry\Point;
use Doctrine\DBAL\DBALException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ReleveController extends AbstractController
{
    public function createReleve(Request $request, ValidatorInterface $validator)
    {
        $em = $this->getDoctrine()->getManager();

        $data = json_decode($request->getContent(), true);

        $dateTime = new \DateTime($data['dateTime']);
        $previousDateTime = new \DateTime($data['previousDateTime']);
        $precipitations = floatval(str_replace(',', '.', $data['precipitations']));
        $pluvio = $em->getRepository(Pluvio::class)->find($data['pluvio']);
        $user = $this->getUser();

        try {
            if ($pluvio->getUser() === $user) {
                $releve = new Releve();
                $releve->setDateTime($dateTime);
                $releve->setPreviousDateTime($previousDateTime);
                $releve->setPrecipitations($precipitations);
                $releve->setPluvio($pluvio);

                $em->persist($releve);
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

        return new Response('Releve successfully created');
    }

    public function editReleve(Request $request, ValidatorInterface $validator)
    {
        $em = $this->getDoctrine()->getManager();

        $data = json_decode($request->getContent(), true);

        $dateTime = new \DateTime($data['dateTime']);
        $previousDateTime = new \DateTime($data['previousDateTime']);
        $precipitations = floatval(str_replace(',', '.', $data['precipitations']));
        $releve = $em->getRepository(Releve::class)->find($data['releve']);
        $user = $this->getUser();

        try {
            if ($releve->getPluvio()->getUser() === $user) {
                $releve->setDateTime($dateTime);
                $releve->setPreviousDateTime($previousDateTime);
                $releve->setPrecipitations($precipitations);

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

        return new Response('Releve successfully created');
    }

    public function releves()
    {
        $em = $this->getDoctrine()->getManager();
        $user = $this->getUser();

        $qb = $em->createQueryBuilder()
            ->select('r')
            ->from(Releve::class, 'r')
            ->join('r.pluvio', 'p')
            ->where('p.user = :userId')
            ->orderBy('r.dateTime', 'DESC')
            ->setParameter('userId', $user->getId());

        $releves = $qb->getQuery()->getResult();

        return new JsonResponse(json_encode($releves), 200);
    }

    public function publicReleves(string $settings)
    {
        $date = new \DateTime("now", new \DateTimeZone("UTC"));

        switch ($settings) {
            case 'last_24_h':
                $date->sub(new \DateInterval('P1D'));
                break;
            case 'last_2_d':
                $date->sub(new \DateInterval('P2D'));
                break;
            case 'last_5_d':
                $date->sub(new \DateInterval('P5D'));
                break;
            case 'last_7_d':
                $date->sub(new \DateInterval('P7D'));
                break;
            case 'last_15_d':
                $date->sub(new \DateInterval('P15D'));
                break;
            case 'last_30_d':
                $date->sub(new \DateInterval('P30D'));
                break;
        }

        $em = $this->getDoctrine()->getManager();

        $qb = $em->createQueryBuilder()
            ->select('p.id', 'X(p.coordinates) AS lat', 'Y(p.coordinates) as lng', 'SUM(r.precipitations) AS total_precipitations', "GROUP_CONCAT(r.precipitations, ';', r.dateTime SEPARATOR '|') as releves")
            ->from(Pluvio::class, 'p')
            ->join('p.releves', 'r')
            ->groupBy('p.id')
            ->where('r.dateTime > :date')
            ->setParameter('date', $date);

        $pluvios = $qb->getQuery()->getResult();

        return new JsonResponse($pluvios, 200);
    }

    public function publicRelevesCustom(string $dateFrom, string $dateTo)
    {
        $dateFrom = new \DateTime($dateFrom);
        $dateTo = new \DateTime($dateTo);

        $em = $this->getDoctrine()->getManager();

        $qb = $em->createQueryBuilder()
            ->select('p.id', 'X(p.coordinates) AS lat', 'Y(p.coordinates) as lng', 'SUM(r.precipitations) AS total_precipitations', "GROUP_CONCAT(r.precipitations, ';', r.dateTime SEPARATOR '|') as releves")
            ->from(Pluvio::class, 'p')
            ->join('p.releves', 'r')
            ->groupBy('p.id')
            ->where('r.dateTime > :dateFrom')
            ->andWhere('r.dateTime < :dateTo')
            ->setParameter('dateFrom', $dateFrom)
            ->setParameter('dateTo', $dateTo);

        $pluvios = $qb->getQuery()->getResult();

        return new JsonResponse($pluvios, 200);
    }

    public function releve(int $id, Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $user = $this->getUser();

        $em = $this->getDoctrine()->getManager();

        $qb = $em->createQueryBuilder()
            ->select('r')
            ->from(Releve::class, 'r')
            ->join('r.pluvio', 'p')
            ->where('p.user = :userId')
            ->andWhere('r.id = :id')
            ->orderBy('r.dateTime', 'DESC')
            ->setMaxResults(1)
            ->setParameter('userId', $user->getId())
            ->setParameter('id', $id);

        $releve = $qb->getQuery()->getOneOrNullResult();

        if ($releve) {
            return new JsonResponse(json_encode($releve), 200);
        } else {
            return new JsonResponse(null, 404);
        }
    }

    public function lastReleve(int $pluvioId, Request $request)
    {
        $em = $this->getDoctrine()->getManager();
        $user = $this->getUser();

        $em = $this->getDoctrine()->getManager();

        $qb = $em->createQueryBuilder()
            ->select('r')
            ->from(Releve::class, 'r')
            ->join('r.pluvio', 'p')
            ->where('p.user = :userId')
            ->andWhere('p.id = :pluvioId')
            ->orderBy('r.dateTime', 'DESC')
            ->setMaxResults(1)
            ->setParameter('userId', $user->getId())
            ->setParameter('pluvioId', $pluvioId);

        $releve = $qb->getQuery()->getOneOrNullResult();

        if ($releve) {
            return new JsonResponse(json_encode($releve), 200);
        } else {
            return new JsonResponse(null, 404);
        }
    }
}