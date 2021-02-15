<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use JsonSerializable;

/**
 * @ORM\Table(name="`releve`")
 * @ORM\Entity()
 */
class Releve implements JsonSerializable
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $dateTime;

    /**
     * @ORM\Column(type="datetime")
     */
    protected $previousDateTime;

    /**
     * @ORM\Column(type="decimal", scale=2)
     */
    protected $precipitations;

    /**
     * @ORM\ManyToOne(targetEntity="Pluvio", inversedBy="releves")
     * @ORM\JoinColumn(nullable=false)
     */
    protected $pluvio;

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $id
     */
    public function setId($id): void
    {
        $this->id = $id;
    }

    /**
     * @return mixed
     */
    public function getDateTime()
    {
        return $this->dateTime;
    }

    /**
     * @param mixed $dateTime
     */
    public function setDateTime($dateTime): void
    {
        $this->dateTime = $dateTime;
    }

    /**
     * @return mixed
     */
    public function getPreviousDateTime()
    {
        return $this->previousDateTime;
    }

    /**
     * @param mixed $previousDateTime
     */
    public function setPreviousDateTime($previousDateTime): void
    {
        $this->previousDateTime = $previousDateTime;
    }

    /**
     * @return mixed
     */
    public function getPrecipitations()
    {
        return $this->precipitations;
    }

    /**
     * @param mixed $precipitations
     */
    public function setPrecipitations($precipitations): void
    {
        $this->precipitations = $precipitations;
    }

    /**
     * @return mixed
     */
    public function getPluvio()
    {
        return $this->pluvio;
    }

    /**
     * @param mixed $pluvio
     */
    public function setPluvio($pluvio): void
    {
        $this->pluvio = $pluvio;
    }

    public function getThisWithoutPluvio() {
        return [
            'id' => $this->id,
            'dateTime' => $this->dateTime,
            'previousDateTime' => $this->previousDateTime,
            'precipitations' => $this->precipitations,
            'user' => [
                'id' => $this->pluvio->getUser()->getId(),
                'name' => $this->pluvio->getUser()->getName(),
            ],
        ];
    }

    public function jsonSerialize() {
        return [
            'id' => $this->id,
            'dateTime' => $this->dateTime,
            'previousDateTime' => $this->previousDateTime,
            'precipitations' => $this->precipitations,
            'user' => [
                'id' => $this->pluvio->getUser()->getId(),
                'name' => $this->pluvio->getUser()->getName(),
            ],
            'pluvio' => $this->pluvio,
        ];
    }
}
