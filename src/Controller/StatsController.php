<?php

namespace App\Controller;

use App\Entity\Pluvio;
use App\Entity\Releve;
use Doctrine\DBAL\DBALException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class StatsController extends AbstractController
{
    const MONTH_STRINGS = [
        1 => 'Janvier',
        2 => 'Février',
        3 => 'Mars',
        4 => 'Avril',
        5 => 'Mai',
        6 => 'Juin',
        7 => 'Juillet',
        8 => 'Août',
        9 => 'Septembre',
        10 => 'Octobre',
        11 => 'Novembre',
        12 => 'Décembre',
    ];

    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function publicAverage(string $format, string $period)
    {
        $stats = [];

        $stats['global'] = $this->getAverageGlobal($format, $period);

        return new JsonResponse($stats, 200);
    }

    public function privateAverage(string $format, string $period)
    {
        $stats = [];

        $stats['global'] = $this->getAverageGlobal($format, $period);
        $stats['user'] = $this->getAverageUser($format, $period);

        return new JsonResponse($stats, 200);
    }

    public function publicAverageCustomDates(string $dateFrom, string $dateTo)
    {
        $stats = [];

        $dateFrom = new \DateTime($dateFrom);
        $dateTo = new \DateTime($dateTo);

        $stats['global'] = $this->getAverageGlobal('days', null, $dateFrom, $dateTo);

        return new JsonResponse($stats, 200);
    }

    public function privateAverageCustomDates(string $dateFrom, string $dateTo)
    {
        $stats = [];

        $dateFrom = new \DateTime($dateFrom);
        $dateTo = new \DateTime($dateTo);

        $stats['global'] = $this->getAverageGlobal('days', null, $dateFrom, $dateTo);
        $stats['user'] = $this->getAverageUser('days', null, $dateFrom, $dateTo);

        return new JsonResponse($stats, 200);
    }

    private function getAverageGlobal($format, $period, ?\DateTime $dateFrom = null, ?\DateTime $dateTo = null)
    {
        $qb = null;

        if ($period) {
            $dateFrom = $this->getDateFrom($format, $period);
            $dateTo = $this->getDateTo($format, $period);
        }

        switch ($format) {
            case 'days':
                $result = $this->getResultForDates($dateFrom, $dateTo);
                break;
            case 'weeks':
                $result = $this->getResultForWeeks($dateFrom, $dateTo);
                break;
            case 'months':
                $result = $this->getResultForMonths($dateFrom, $dateTo);
                break;
            case 'years':
                $result = $this->getResultForYears($dateFrom, $dateTo);
                break;
        }

        return $result;
    }

    private function getAverageUser($format, $period, ?\DateTime $dateFrom = null, ?\DateTime $dateTo = null)
    {
        $formatSelectSQL = "";

        if ($period) {
            $dateFrom = $this->getDateFrom($format, $period);
            $dateTo = $this->getDateTo($format, $period);
        }

        switch ($format) {
            case 'days':
                $formatSelectSQL = "CAST(CONVERT_TZ(r.dateTime, '+00:00', '+01:00') AS DATE) AS castDate";
                break;
            case 'weeks':
                $formatSelectSQL = "WEEK(CONVERT_TZ(r.dateTime, '+00:00', '+01:00'), 1) AS castDate";
                break;
            case 'months':
                $formatSelectSQL = "MONTH(CONVERT_TZ(r.dateTime, '+00:00', '+01:00')) AS castDate";
                break;
            case 'years':
                $formatSelectSQL = "YEAR(CONVERT_TZ(r.dateTime, '+00:00', '+01:00')) AS castDate";
                break;
        }

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
                $formatSelectSQL,
                'SUM(r.precipitations) AS avgPrecipitations'
            )
            ->from(Pluvio::class, 'p')
            ->join('p.releves', 'r')
            ->groupBy('castDate')
            ->addGroupBy('p.id')
            ->where('p.id IN (:pluvios)')
            ->setParameter('pluvios', $pluviosIds)
            ->andWhere('r.dateTime > :dateFrom')
            ->andWhere('r.dateTime < :dateTo')
            ->setParameter('dateFrom', $dateFrom)
            ->setParameter('dateTo', $dateTo);

        $results = $qb->getQuery()->getResult();

        if ($format === 'months') {
            foreach ($results as $key => $result) {
                $results[$key]['castDate'] = $this::MONTH_STRINGS[intval($result['castDate'])];
            }
        }

        return $results;
    }

    function getDateFrom($format, $period) {
        switch ($format) {
            case 'days':
                $dateFrom = new \DateTime();
                return $dateFrom->modify('00:00')->modify("-".(intval($period) - 1)." ".$format);
                break;
            case 'weeks':
                $dateFrom = new \DateTime();
                return $dateFrom->modify('00:00')->modify("-".(intval($period) - 1)." ".$format)->modify('Monday this week');
                break;
            case 'months':
                $dateFrom = new \DateTime();
                return $dateFrom->modify('00:00')->modify("-".(intval($period) - 1)." ".$format)->modify('first day of this month');
                break;
            case 'years':
                $dateFrom = new \DateTime();
                return $dateFrom->modify('00:00')->modify("-".(intval($period) - 1)." ".$format)->modify('first day of this year');
                break;
        }
    }

    function getDateTo($format, $period) {
        switch ($format) {
            case 'days':
                $dateTo = new \DateTime();
                return $dateTo->modify('23:59');
                break;
            case 'weeks':
                $dateTo = new \DateTime();
                return $dateTo->modify('23:59')->modify('Sunday this week');
                break;
            case 'months':
                $dateTo = new \DateTime();
                return $dateTo->modify('23:59')->modify('last day of this month');
                break;
            case 'years':
                $dateTo = new \DateTime();
                return $dateTo->modify('23:59')->modify('last day of this year');
                break;
        }
    }

    function getResultForDates(\DateTime $dateFrom, \DateTime $dateTo) {
        return $this->em->createQueryBuilder()
            ->select(
                "CAST(CONVERT_TZ(r.dateTime, '+00:00', '+01:00') AS DATE) AS castDate",
                'ROUND(AVG(r.precipitations), 2) AS avgPrecipitations'
            )
            ->from(Pluvio::class, 'p')
            ->join('p.releves', 'r')
            ->groupBy('castDate')
            ->where('r.dateTime > :dateFrom')
            ->andWhere('r.dateTime < :dateTo')
            ->setParameter('dateFrom', $dateFrom)
            ->setParameter('dateTo', $dateTo)
            ->getQuery()->getResult();
    }

    function getResultForWeeks(\DateTime $dateFrom, \DateTime $dateTo) {
        $queryresults = $this->em->createQueryBuilder()
            ->select(
                'p.id as pluvioId',
                "WEEK(CAST(CONVERT_TZ(r.dateTime, '+00:00', '+01:00') AS DATE), 1) AS castDate",
                'SUM(r.precipitations) AS sumPrecipitations'
            )
            ->from(Pluvio::class, 'p')
            ->join('p.releves', 'r')
            ->groupBy('castDate')
            ->addGroupBy('pluvioId')
            ->where('r.dateTime > :dateFrom')
            ->andWhere('r.dateTime < :dateTo')
            ->setParameter('dateFrom', $dateFrom)
            ->setParameter('dateTo', $dateTo)
            ->getQuery()->getResult();

        $resultsOfPluviosByWeeks = [];

        foreach ($queryresults as $queryResult) {
            $resultsOfPluviosByWeeks[$queryResult['castDate']][$queryResult['pluvioId']] = $queryResult['sumPrecipitations'];
        }

        $avgByWeeks = [];

        foreach ($resultsOfPluviosByWeeks as $weekNumber => $resultsOfPluviosForOneWeek) {
            $totalOfPluviosForOneWeek = array_sum($resultsOfPluviosForOneWeek);
            $totalByWeek = $totalOfPluviosForOneWeek/count($resultsOfPluviosForOneWeek);
            $avgByWeeks[] = [
                'castDate' => $weekNumber,
                'avgPrecipitations' => number_format((float)$totalByWeek, 2, '.', '')
            ];
        }

        return $avgByWeeks;
    }

    function getResultForMonths(\DateTime $dateFrom, \DateTime $dateTo) {
        $queryresults = $this->em->createQueryBuilder()
            ->select(
                'p.id as pluvioId',
                "MONTH(CAST(CONVERT_TZ(r.dateTime, '+00:00', '+01:00') AS DATE)) AS castDate",
                'SUM(r.precipitations) AS sumPrecipitations'
            )
            ->from(Pluvio::class, 'p')
            ->join('p.releves', 'r')
            ->groupBy('castDate')
            ->addGroupBy('pluvioId')
            ->where('r.dateTime > :dateFrom')
            ->andWhere('r.dateTime < :dateTo')
            ->setParameter('dateFrom', $dateFrom)
            ->setParameter('dateTo', $dateTo)
            ->getQuery()->getResult();

        $resultsOfPluviosByMonths = [];

        foreach ($queryresults as $queryResult) {
            $resultsOfPluviosByMonths[$queryResult['castDate']][$queryResult['pluvioId']] = $queryResult['sumPrecipitations'];
        }

        $avgByMonths = [];

        foreach ($resultsOfPluviosByMonths as $monthNumber => $resultsOfPluviosForOneMonth) {
            $totalOfPluviosForOneMonth = array_sum($resultsOfPluviosForOneMonth);
            $totalByMonth = $totalOfPluviosForOneMonth/count($resultsOfPluviosForOneMonth);
            $avgByMonths[] = [
                'castDate' => $this::MONTH_STRINGS[$monthNumber],
                'avgPrecipitations' => number_format((float)$totalByMonth, 2, '.', '')
            ];
        }

        return $avgByMonths;
    }

    function getResultForYears(\DateTime $dateFrom, \DateTime $dateTo) {
        $queryresults = $this->em->createQueryBuilder()
            ->select(
                'p.id as pluvioId',
                "YEAR(CAST(CONVERT_TZ(r.dateTime, '+00:00', '+01:00') AS DATE)) AS castDate",
                'SUM(r.precipitations) AS sumPrecipitations'
            )
            ->from(Pluvio::class, 'p')
            ->join('p.releves', 'r')
            ->groupBy('castDate')
            ->addGroupBy('pluvioId')
            ->where('r.dateTime > :dateFrom')
            ->andWhere('r.dateTime < :dateTo')
            ->setParameter('dateFrom', $dateFrom)
            ->setParameter('dateTo', $dateTo)
            ->getQuery()->getResult();

        $resultsOfPluviosByYears = [];

        foreach ($queryresults as $queryResult) {
            $resultsOfPluviosByYears[$queryResult['castDate']][$queryResult['pluvioId']] = $queryResult['sumPrecipitations'];
        }

        $avgByYears = [];

        foreach ($resultsOfPluviosByYears as $yearNumber => $resultsOfPluviosForOneYear) {
            $totalOfPluviosForOneYear = array_sum($resultsOfPluviosForOneYear);
            $totalByYear = $totalOfPluviosForOneYear/count($resultsOfPluviosForOneYear);
            $avgByYears[] = [
                'castDate' => strval($yearNumber),
                'avgPrecipitations' => number_format((float)$totalByYear, 2, '.', '')
            ];
        }

        return $avgByYears;
    }
}