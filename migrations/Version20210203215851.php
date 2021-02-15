<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210203215851 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE `pluvio` (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, coordinates POINT NOT NULL COMMENT \'(DC2Type:point)\', INDEX IDX_838DDE45A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE `releve` (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, pluvio_id INT DEFAULT NULL, date_time DATETIME NOT NULL, previous_date_time DATETIME NOT NULL, precipitations NUMERIC(10, 0) NOT NULL, INDEX IDX_DDABFF83A76ED395 (user_id), INDEX IDX_DDABFF839CA29D94 (pluvio_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE `pluvio` ADD CONSTRAINT FK_838DDE45A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE `releve` ADD CONSTRAINT FK_DDABFF83A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE `releve` ADD CONSTRAINT FK_DDABFF839CA29D94 FOREIGN KEY (pluvio_id) REFERENCES `pluvio` (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE `releve` DROP FOREIGN KEY FK_DDABFF839CA29D94');
        $this->addSql('DROP TABLE `pluvio`');
        $this->addSql('DROP TABLE `releve`');
    }
}
