<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use JsonSerializable;

/**
 * @ORM\Table(name="`pluvio`")
 * @ORM\Entity()
 */
class Pluvio implements JsonSerializable
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string")
     */
    private $name;

    /**
     * @ORM\Column(type="point", nullable=false)
     */
    private $coordinates;

    /**
     * @ORM\ManyToOne(targetEntity="User", inversedBy="releves")
     * @ORM\JoinColumn(nullable=false)
     */
    protected $user;

    /**
     * @ORM\OneToMany(targetEntity="Releve", mappedBy="pluvio")
     */
    protected $releves;

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
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param mixed $name
     */
    public function setName($name): void
    {
        $this->name = $name;
    }

    /**
     * @return mixed
     */
    public function getCoordinates()
    {
        return $this->coordinates;
    }

    /**
     * @param mixed $coordinates
     */
    public function setCoordinates($coordinates): void
    {
        $this->coordinates = $coordinates;
    }

    /**
     * @return mixed
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * @param mixed $user
     */
    public function setUser($user): void
    {
        $this->user = $user;
    }

    /**
     * @return mixed
     */
    public function getReleves()
    {
        return $this->releves;
    }

    public function getRelevesWithoutPluvios() {
        $releves = [];
        foreach ($this->releves as $releve) {
            $releves[] = $releve->getThisWithoutPluvio();
        }
        return $releves;
    }

    /**
     * @param mixed $releves
     */
    public function setReleves($releves): void
    {
        $this->releves = $releves;
    }

    public function jsonSerialize() {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'coordinates' => [
                'lat' => $this->coordinates->getX(),
                'lng' => $this->coordinates->getY(),
            ],
            'nbReleves' => count($this->releves),
        ];
    }
}
