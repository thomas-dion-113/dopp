# DOPP
## Données ouvertes de pluviométrie pour les paludiers
### Installation
- Copy .env.dist file to .env and put your settings
- `composer install`
- `bin/console d:s:u --force`
- `yarn install`
- `yarn encore production`
- `mkdir config/jwt`
- `openssl genrsa -out config/jwt/private.pem -aes256 4096`
- `openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem`
- Set 'public' folder to web root