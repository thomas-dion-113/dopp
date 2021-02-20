<?php

namespace App\Controller;

use App\Entity\Pluvio;
use App\Entity\Releve;
use Doctrine\DBAL\DBALException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class StatsController extends AbstractController
{

    public function publicAverage()
    {
        $stats = [];

        $stats['global'] = $this->getAverageGlobal();

        return new JsonResponse($stats, 200);
    }

    public function privateAverage()
    {
        $stats = [];

        $stats['global'] = $this->getAverageGlobal();
        $stats['user'] = $this->getAverageUser();

        return new JsonResponse($stats, 200);
    }

    public function publicAverageCustomDates(string $dateFrom, string $dateTo)
    {
        $stats = [];

        $dateFrom = new \DateTime($dateFrom);
        $dateTo = new \DateTime($dateTo);

        $stats['global'] = $this->getAverageGlobal($dateFrom, $dateTo);

        return new JsonResponse($stats, 200);
    }

    public function privateAverageCustomDates(string $dateFrom, string $dateTo)
    {
        $stats = [];

        $dateFrom = new \DateTime($dateFrom);
        $dateTo = new \DateTime($dateTo);

        $stats['global'] = $this->getAverageGlobal($dateFrom, $dateTo);
        $stats['user'] = $this->getAverageUser($dateFrom, $dateTo);

        return new JsonResponse($stats, 200);
    }

    private function getAverageGlobal(?\DateTime $dateFrom = null, ?\DateTime $dateTo = null)
    {
        $em = $this->getDoctrine()->getManager();

        $qb = $em->createQueryBuilder()
            ->select(
                "CAST(CONVERT_TZ(r.dateTime, '+00:00', '+01:00') AS DATE) AS castDate",
                'AVG(r.precipitations) AS avgPrecipitations'
            )
            ->from(Pluvio::class, 'p')
            ->join('p.releves', 'r')
            ->groupBy('castDate');

        if ($dateFrom && $dateTo) {
            $qb->where('r.dateTime > :dateFrom')
                ->andWhere('r.dateTime < :dateTo')
                ->setParameter('dateFrom', $dateFrom)
                ->setParameter('dateTo', $dateTo);
        }

        return $qb->getQuery()->getResult();
    }

    private function getAverageUser(?\DateTime $dateFrom = null, ?\DateTime $dateTo = null)
    {
        $pluviosIds = [];
        $em = $this->getDoctrine()->getManager();
        $pluvios = $this->getUser()->getPluvios();

        foreach ($pluvios as $pluvio) {
            $pluviosIds[] = $pluvio->getId();
        }

        $qb = $em->createQueryBuilder()
            ->select(
                'p.id',
                'p.name',
                "CAST(CONVERT_TZ(r.dateTime, '+00:00', '+01:00') AS DATE) AS castDate",
                'AVG(r.precipitations) AS avgPrecipitations'
            )
            ->from(Pluvio::class, 'p')
            ->join('p.releves', 'r')
            ->groupBy('castDate')
            ->addGroupBy('p.id')
            ->where('p.id IN (:pluvios)')
            ->setParameter('pluvios', $pluviosIds);

        if ($dateFrom && $dateTo) {
            $qb->andWhere('r.dateTime > :dateFrom')
                ->andWhere('r.dateTime < :dateTo')
                ->setParameter('dateFrom', $dateFrom)
                ->setParameter('dateTo', $dateTo);
        }

        return $qb->getQuery()->getResult();
    }
}