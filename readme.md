#DOPP
##Données ouvertes de pluviométrie pour les paludiers
###Installation
- `composer install`
- `bin/console d:s:u --force`
- `yarn install`
- `yarn encore production`
- `mkdir config/jwt`
- `openssl genrsa -out config/jwt/private.pem -aes256 4096`
- `openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem`

- Copy .env.dist file to .env and put your settings