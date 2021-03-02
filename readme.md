# DOPP
## Données ouvertes de pluviométrie pour les paludiers
### Installation
#### Production
- Create a MYSQL database
- Copy .env.dist file to .env and put your settings
- `composer install`
- `bin/console d:s:u --force`
- `yarn install`
- `yarn encore production`
- `mkdir config/jwt`
- `openssl genrsa -out config/jwt/private.pem -aes256 4096`
- `openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem`
- Put your JWT settings in .env file
- Set 'public' folder to web root

#### Development
- Create a MYSQL database
- Copy .env.dist file to .env and put your settings
- Set 'public_url' to 'http://127.0.0.1:8000' in .env file
- Create a Mapbox account and put your token in .env file
- `composer install`
- `bin/console d:s:u --force`
- `yarn install`
- `mkdir config/jwt`
- `openssl genrsa -out config/jwt/private.pem -aes256 4096`
- `openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem`
- Put your JWT settings in .env file
- `bin/console server:start`
- `yarn encore dev --watch`
- Go to http://127.0.0.1:8000